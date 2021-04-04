import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import CopyPlugin from "copy-webpack-plugin";
import bufferReplace from "buffer-replace";
import { resolve, dirname, basename } from "path";
import { merge } from "lodash";
import { cp, readFile } from "snowboard-helper";
import urlJoin from "url-join";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import {
  setupDir,
  buildSeed,
  writeSeed,
  writeJSON,
  watchTemplate,
  watchOverrides,
  watchInput,
  copyOverrides,
} from "./builder";

const defaultConfig = {
  overrides: {},
  playground: { enabled: false },
};

async function packer(
  input,
  { config: loadedConfig, watch, output, template, optimized, quiet }
) {
  const { outDir, buildDir } = await setupDir(output);

  const publicPath = detectPublicPath(outDir);

  const config = Object.assign(
    {},
    merge(defaultConfig, { basePath: urlJoin(publicPath, "/") }, loadedConfig)
  );

  const [seeds, transitionSeeds] = await buildSeed(input, config, { quiet });

  const templateDir = dirname(template);
  const entrypoint = resolve(
    buildDir,
    basename(template).replace(".html", ".js")
  );

  await cp(templateDir, buildDir);
  await copyOverrides(config.overrides, buildDir);
  await writeSeed(buildDir, seeds, { optimized });
  await writeJSON(outDir, transitionSeeds, seeds.uuids, { optimized });

  if (watch) {
    watchInput(input, config, outDir, buildDir, { optimized, quiet });
    watchTemplate(templateDir, buildDir);
    watchOverrides(config.overrides || {}, buildDir);
  }

  return {
    entry: entrypoint,
    context: buildDir,
    output: {
      path: outDir,
      publicPath,
      filename: "index.js",
    },
    mode: optimized ? "production" : "development",
    devtool: optimized ? false : "source-map",
    resolve: {
      extensions: [".wasm", ".mjs", ".js", ".json", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"],
      modules: moduleDirs(templateDir),
    },
    module: {
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: require.resolve("svelte-loader-hot"),
            options: {
              emitCss: !watch,
              hotReload: watch,
            },
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                [
                  require.resolve("@babel/preset-env"),
                  { targets: "last 2 chrome versions" },
                ],
                require.resolve("@babel/preset-react"),
              ],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            !watch
              ? MiniCssExtractPlugin.loader
              : require.resolve("style-loader"),
            require.resolve("css-loader"),
          ],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: template,
            to: outDir,
            transform(content, path) {
              return normalize(content, publicPath);
            },
          },
        ],
      }),
      new MiniCssExtractPlugin({
        filename: "index.css",
      }),
    ],
    performance: {
      maxEntrypointSize: 2000000,
    },
  };
}

export async function htmlPack(input, options) {
  const config = await packer(input, options);
  const compiler = webpack(config);

  if (options.watch) {
    return new Promise((resolve, reject) => {
      compiler.watch({
        poll: process.env.WEBPACK_WATCH_OPTION_POLL,
      }, (err, stats) => {
        if (err) return reject(err);
        resolve(stats);
      });
    });
  }

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

export async function httpPack(input, options) {
  const { port, host = "localhost", watch, quiet } = options;

  const config = await packer(input, options);

  if (watch) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  const compiler = webpack(config);
  const publicPath = "/";
  const serverOptions = {
    contentBase: config.output.path,
    liveReload: false,
    quiet,
    hot: watch,
    publicPath,
    disableHostCheck: true,
    before: async (app, server, compiler) => {
      const templateContent = await readFile(options.template);
      const content = normalize(templateContent, config.output.publicPath);

      app.get("*", async (req, res, next) => {
        if (req.path.match("hot-update")) {
          if (dirname(req.path) !== publicPath) {
            return res.redirect(publicPath + basename(req.path));
          }
        }

        if (
          req.path.endsWith(".js") ||
          req.path.endsWith(".json") ||
          req.path.match("sockjs")
        ) {
          return next();
        }

        res.set("Content-Type", "text/html");
        res.send(content);
      });
    },
  };

  if (options.ssl) {
    serverOptions.https = {
      cert: options.cert,
      key: options.key,
    };
  }

  const server = new WebpackDevServer(compiler, serverOptions);

  return new Promise((resolve, reject) => {
    server.listen(port, host, (err) => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}

function normalize(content, publicPath) {
  return bufferReplace(content, "./", urlJoin(publicPath, "/"));
}

function detectPublicPath(outDir) {
  const publicPath = outDir.replace(process.cwd(), "");
  const slashIndex = publicPath.indexOf("/", 1);

  if (slashIndex == -1) {
    return "/";
  }

  return publicPath.substr(slashIndex);
}

function moduleDirs(templateDir) {
  const { _where: installDir } = require("../package.json");

  if (installDir) {
    return [resolve(installDir, "node_modules"), resolve(installDir, "../")];
  }

  return [
    resolve(__dirname, "../node_modules"),
    resolve(templateDir, "../node_modules"),
    resolve(templateDir, "../../snowboard-theme-helper/node_modules"),
  ];
}
