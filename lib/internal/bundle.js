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

const mkdirpAsync = util.promisify(mkdirp);
const defaultTemplateDir = path.resolve(__dirname, "..", "..", "templates");

function templateFile(name) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  return path.resolve(defaultTemplateDir, "winter.html");
}

function writeTmp(data) {
  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, data, "utf8");

  return tmpFile.name;
}

function outputDir(name) {
  if (name) {
    return path.resolve(name);
  }

  return tmp.dirSync().name;
}

function buildInputOptions(props, options) {
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

  const input = writeTmp(tplJs);

  return {
    input: input,
    plugins: [svelte(), resolve({ browser: true }), commonjs(), terser()]
  };
}

async function htmlBundle(result, options) {
  const tplFile = templateFile(options.template, options.legacy);
  const props = {
    title: result.title,
    description: result.description,
    version: result.version,
    servers: result.servers,
    tags: result.tags,
    actions: result.actions,
    tagActions: result.tagActions
  };

  const inputOptions = buildInputOptions(props, options);
  const outputOptions = {
    format: "iife",
    name: "main"
  };

  let output = options.output;

  if (output && output.endsWith(".html")) {
    outputOptions.file = path
      .basename(output)
      .replace(".html", "-bundle.js");
  } else {
    output = outputDir(output);
    await mkdirpAsync(output);

    outputOptions.file = path.resolve(output, "index-bundle.js");
  }

  const bundleScript = `<script src="/${path.basename(
    outputOptions.file
  )}"></script>`;

  let tplHtml = fs.readFileSync(tplFile, "utf8");
  tplHtml = tplHtml.replace("<!-- BUNDLE-SCRIPT -->", bundleScript);

  if (output && output.endsWith(".html")) {
    fs.writeFileSync(output, tplHtml, "utf8");
  } else {
    fs.writeFileSync(
      path.resolve(path.dirname(outputOptions.file), "index.html"),
      tplHtml,
      "utf8"
    );
  }

  const bundle = await rollup.rollup(inputOptions);

  await bundle.generate(outputOptions);
  await bundle.write(outputOptions);

  return output;
}

module.exports = {
  htmlBundle
};
