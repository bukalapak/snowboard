import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import CopyPlugin from "copy-webpack-plugin";
import { resolve, dirname, basename } from "path";
import { merge } from "lodash";
import { cp } from "snowboard-helper";

import {
  setupDir,
  buildSeed,
  writeSeed,
  writeJSON,
  watchTemplate,
  watchOverrides,
  watchInput
} from "./builder";

const defaultConfig = {
  overrides: {},
  playground: { enabled: false }
};

async function packer(
  input,
  { config: loadedConfig, watch, output, template, optimized, quiet }
) {
  const config = merge(defaultConfig, loadedConfig);

  const { outDir, buildDir, htmlDir } = await setupDir(output);
  const [seeds, transitionSeeds] = await buildSeed(input, config, { quiet });

  const templateDir = dirname(template);
  const entrypoint = resolve(
    buildDir,
    basename(template).replace(".html", ".js")
  );

  await cp(templateDir, buildDir);
  await writeSeed(buildDir, seeds, { optimized });
  await writeJSON(outDir, transitionSeeds, seeds.uuids, { optimized });

  if (watch) {
    watchInput(input, config, outDir, buildDir, { optimized, quiet });
    watchTemplate(templateDir, buildDir);
    watchOverrides(config.overrides || {}, buildDir);
  }

  return {
    entry: {
      index: entrypoint
    },
    context: buildDir,
    output: {
      path: htmlDir,
      filename: "[name].js",
      chunkFilename: "[name].[id].js"
    },
    mode: optimized ? "production" : "development",
    devtool: optimized ? false : "source-map",
    watch,
    resolve: {
      extensions: [".mjs", ".js", ".svelte"],
      mainFields: ["svelte", "browser", "module", "main"]
    },
    module: {
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: "svelte-loader",
            options: {
              hotReload: watch
            }
          }
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "last 2 chrome versions" }],
                "@babel/preset-react"
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new CopyPlugin([
        {
          from: template,
          to: htmlDir
        }
      ])
    ]
  };
}

export async function htmlPack(input, options) {
  const config = await packer(input, options);
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

export async function httpPack(input, options) {
  const { port, host, watch } = options;

  const config = await packer(input, options);

  if (watch) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  const server = new WebpackDevServer(webpack(config), {
    contentBase: config.output.path,
    hot: watch
  });

  return new Promise((resolve, reject) => {
    server.listen(port, host, err => {
      if (err) return reject(err);
      resolve(server);
    });
  });
}
