const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const tmp = require("tmp");
const util = require("util");

const rollup = require("rollup");
const svelte = require("rollup-plugin-svelte");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const { terser } = require("rollup-plugin-terser");

const Handlebars = require("handlebars");
const stripDirs = require("strip-dirs");

const mkdirpAsync = util.promisify(mkdirp);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const tmpFileAsync = util.promisify(tmp.file);

const { load: loadConfig } = require("./config");

const defaultHtmlConfig = { playground: { enabled: false }, optimized: false };

const defaultTemplateDir = path.resolve(__dirname, "..", "..", "templates");

function templateFile(name) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  return path.resolve(defaultTemplateDir, "winter.html");
}

async function writeTmp(data) {
  const tmpFile = await tmpFileAsync();
  await writeFileAsync(tmpFile, data, "utf8");
  return tmpFile;
}

function isHtml(output) {
  return output && output.endsWith(".html");
}

function stripFirst(dir) {
  const val = stripDirs(dir || "", 1);

  if (val === ".") {
    return "";
  }

  return val;
}

function bundleName(output, suffix) {
  if (!output) {
    return;
  }

  if (isHtml(output)) {
    return path.basename(output).replace(".html", suffix);
  } else {
    outputDir = path.resolve(output);
    return path.resolve(outputDir, `index${suffix}`);
  }
}

async function buildInputOptions(props, options) {
  const tplFile = templateFile(options.template);
  const tplSv = tplFile.replace(".html", ".svelte");

  const tplJs = `
import App from '${tplSv}';

const app = new App({
  target: document.body,
  props: ${JSON.stringify(props)}
});

export default app;
  `;

  const input = await writeTmp(tplJs);
  const svelteOptions = {};

  if (options.output && !isHtml(options.output)) {
    svelteOptions.css = css => {
      css.write(bundleName(options.output, "-bundle.css"), !!options.optimized);
    };
  }

  const plugins = [
    svelte(svelteOptions),
    resolve({ browser: true }),
    commonjs()
  ];

  if (options.optimized) {
    plugins.push(terser());
  }

  return {
    input,
    plugins
  };
}

async function buildOutputOptions(options) {
  const outputOptions = {
    format: "iife",
    name: "main"
  };

  if (options.output) {
    outputOptions.file = bundleName(options.output, "-bundle.js");

    if (!isHtml(options.output)) {
      await mkdirpAsync(path.resolve(options.output));
    } else {
      await mkdirpAsync(path.dirname(options.output));
    }
  }

  return outputOptions;
}

async function writeInline(bundle, options) {
  return await buildOutput(
    () => {
      return `<script>${bundle[0].code}</script>`;
    },
    () => "",
    options
  );
}

async function buildOutput(fn, fns, options) {
  const handlebars = Handlebars.create();
  handlebars.registerHelper("bundleScript", fn);
  handlebars.registerHelper("bundleStyle", fns);

  const tplFile = templateFile(options.template);
  const tplHtml = await readFileAsync(tplFile, "utf8");
  const template = handlebars.compile(tplHtml);

  return template({});
}

async function loadConfigFile(options) {
  const { html: htmlConfig = defaultHtmlConfig } = await loadConfig(
    options.config
  );

  if (options.playground) {
    htmlConfig.playground.enabled = true;
  }

  if (!htmlConfig.basePath) {
    htmlConfig.basePath = "/";

    if (options.output) {
      if (!isHtml(options.output) && !path.isAbsolute(options.output)) {
        const basePath = stripFirst(options.output);

        if (options.output !== basePath) {
          htmlConfig.basePath = `/${basePath}`;
        }
      }
    }
  }

  return htmlConfig;
}

function htmlBasePath(config) {
  if (config.basePath.endsWith("/")) {
    return config.basePath;
  } else {
    return config.basePath + "/";
  }
}

async function htmlBundle(result, options) {
  if (options.playground && !options.config) {
    throw new Error(
      "Playground mode requires a configuration file. You can pass `-c` flag."
    );
  }

  const htmlConfig = await loadConfigFile(options);

  const props = {
    title: result.title,
    description: result.description,
    version: result.version,
    servers: result.servers,
    tags: result.tags,
    actions: result.actions,
    tagActions: result.tagActions,
    config: htmlConfig
  };

  const inputOptions = await buildInputOptions(props, options);
  const outputOptions = await buildOutputOptions(options);

  const bundle = await rollup.rollup(inputOptions);

  const { output: bundleOutput } = await bundle.generate(outputOptions);

  if (!options.output) {
    return writeInline(bundleOutput, options);
  }

  if (isHtml(options.output)) {
    const tplHtml = await writeInline(bundleOutput, options);
    await writeFileAsync(options.output, tplHtml, "utf8");
    return options.output;
  }

  await bundle.write(outputOptions);

  const bundlePath = path.basename(outputOptions.file);
  const bundleStyle = path.basename(bundleName(options.output, "-bundle.css"));
  const basePath = htmlBasePath(props.config);

  const tplHtml = await buildOutput(
    () => {
      return `<script src="${basePath}${bundlePath}"></script>`;
    },
    () => {
      return `<link rel="stylesheet" href="${basePath}${bundleStyle}" />`;
    },
    options
  );

  await writeFileAsync(
    path.resolve(path.dirname(outputOptions.file), "index.html"),
    tplHtml,
    "utf8"
  );

  return options.output;
}

module.exports = {
  htmlBundle
};
