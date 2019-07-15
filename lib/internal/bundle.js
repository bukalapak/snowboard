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

const mkdirpAsync = util.promisify(mkdirp);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const tmpFileAsync = util.promisify(tmp.file);

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

  return {
    input: input,
    plugins: [svelte(), resolve({ browser: true }), commonjs(), terser()]
  };
}

async function buildOutputOptions(options) {
  const outputOptions = {
    format: "iife",
    name: "main"
  };

  if (options.output) {
    if (options.output.endsWith(".html")) {
      outputOptions.file = path
        .basename(options.output)
        .replace(".html", "-bundle.js");
    } else {
      output = path.resolve(options.output);
      await mkdirpAsync(output);

      outputOptions.file = path.resolve(output, "index-bundle.js");
    }
  }

  return outputOptions;
}

async function writeInline(bundle, options) {
  return await buildOutput(() => {
    return `<script>${bundle[0].code}</script>`;
  }, options);
}

async function buildOutput(fn, options) {
  const handlebars = Handlebars.create();
  handlebars.registerHelper("bundleScript", fn);

  const tplFile = templateFile(options.template);
  const tplHtml = await readFileAsync(tplFile, "utf8");
  const template = handlebars.compile(tplHtml);

  return template({});
}

async function htmlBundle(result, options) {
  const props = {
    title: result.title,
    description: result.description,
    version: result.version,
    servers: result.servers,
    tags: result.tags,
    actions: result.actions,
    tagActions: result.tagActions
  };

  const inputOptions = await buildInputOptions(props, options);
  const outputOptions = await buildOutputOptions(options);

  const bundle = await rollup.rollup(inputOptions);

  const { output: bundleOutput } = await bundle.generate(outputOptions);

  if (!options.output) {
    return writeInline(bundleOutput, options);
  }

  if (options.output.endsWith(".html")) {
    const tplHtml = await writeInline(bundleOutput, options);
    await writeFileAsync(options.output, tplHtml, "utf8");
    return options.output;
  }

  await bundle.write(outputOptions);

  const bundlePath = path.basename(outputOptions.file);
  const tplHtml = await buildOutput(() => {
    return `<script src="/${bundlePath}"></script>`;
  }, options);

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
