const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const tmp = require("tmp");
const util = require("util");

const rollup = require("rollup");
const svelte = require("rollup-plugin-svelte");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const serve = require("rollup-plugin-serve");
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

function parseBinding(str) {
  const [hostStr, portStr] = str.split(":");
  const port = parseInt(portStr, 10);
  const host = hostStr === "" ? undefined : hostStr;

  return [host, port];
}

async function htmlBundle(result, options) {
  const tplFile = templateFile(options.template, options.legacy);
  const tplSv = tplFile.replace(".html", ".svelte");

  const props = {
    title: result.title,
    description: result.description,
    version: result.version,
    servers: result.servers,
    tags: result.tags,
    actions: result.actions,
    tagActions: result.tagActions
  };

  const tplJs = `
import App from '${tplSv}';

const app = new App({
  target: document.body,
  props: ${JSON.stringify(props)}
});

export default app;
  `;

  const tmpInput = writeTmp(tplJs);

  const inputOptions = {
    input: tmpInput,
    plugins: [svelte(), resolve({ browser: true }), commonjs()]
  };

  const outputOptions = {
    format: "iife",
    name: "main"
  };

  const bind = options.bind ? options.bind : ":8088";
  const [host, port] = parseBinding(bind);

  const serveOptions = {
    contentBase: "",
    verbose: true,
    host: host,
    port: port
  };

  if (options.output && options.output.endsWith(".html")) {
    outputOptions.file = path
      .basename(options.output)
      .replace(".html", "-bundle.js");
  } else {
    const outDir = outputDir(options.output);
    await mkdirpAsync(outDir);

    outputOptions.file = path.resolve(outDir, "index-bundle.js");
    serveOptions.contentBase = outDir;
  }

  const bundleScript = `<script src="/${path.basename(
    outputOptions.file
  )}"></script>`;

  let tplHtml = fs.readFileSync(tplFile, "utf8");
  tplHtml = tplHtml.replace("<!-- BUNDLE-SCRIPT -->", bundleScript);

  if (options.output && options.output.endsWith(".html")) {
    fs.writeFileSync(options.output, tplHtml, "utf8");
  } else {
    fs.writeFileSync(
      path.resolve(path.dirname(outputOptions.file), "index.html"),
      tplHtml,
      "utf8"
    );
  }

  if (options.name() === "http") {
    inputOptions.plugins.push(serve(serveOptions));
  } else {
    inputOptions.plugins.push(terser());
  }

  const bundle = await rollup.rollup(inputOptions);

  await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
}

module.exports = {
  htmlBundle
};
