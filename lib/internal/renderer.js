const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const tmp = require("tmp");
const util = require("util");
const { table, getBorderCharacters } = require("table");

const rollup = require("rollup");
const svelte = require("rollup-plugin-svelte");
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

const mkdirpAsync = util.promisify(mkdirp);
const defaultTemplateDir = path.resolve(__dirname, "..", "..", "templates");
const tableConfig = {
  border: getBorderCharacters("ramac")
};

function lint(result) {
  const data = result.map(item => {
    return [
      item.location
        .map(loc => `line ${loc.line}, column ${loc.column}`)
        .join(" - "),
      item.severity,
      item.description
    ];
  });

  data.unshift(["Location", "Severity", "Description"]);
  console.log(table(data, tableConfig));
}

async function list(result) {
  result.actions.forEach(action => {
    action.transactions.forEach(transaction => {
      console.log(
        [
          action.method.toUpperCase(),
          transaction.response.statusCode,
          action.path
        ].join("\t")
      );
    });
  });
}

function templateFile(name) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  return path.resolve(defaultTemplateDir, "winter.html");
}

function writeTmp(data) {
  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, data, 'utf8');

  return tmpFile.name;
}

function outputDir(name) {
  if (name) {
    return path.resolve(name);
  }

  return tmp.dirSync().name;
}

async function htmlBundle(result, options) {
  const tplFile = templateFile(options.template, options.legacy);
  const tplSv = tplFile.replace('.html', '.svelte');

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
    plugins: [
      svelte(),
      resolve({ browser: true }),
      commonjs(),
      terser(),
    ]
  }

  const outputOptions = {
    format: 'iife',
    name: 'main'
  }

  if (options.output && options.output.endsWith('.html')) {
    outputOptions.file = path.basename(options.output).replace('.html', '-bundle.js');
  } else {
    const outDir = outputDir(options.output)
    await mkdirpAsync(outDir);

    outputOptions.file = path.resolve(outDir, "index-bundle.js");
  }

  const bundleScript = `<script src="/${path.basename(outputOptions.file)}"></script>`;
  let tplHtml = fs.readFileSync(tplFile, 'utf8');
  tplHtml = tplHtml.replace('<!-- BUNDLE-SCRIPT -->', bundleScript);

  if (options.output && options.output.endsWith('.html')) {
    fs.writeFileSync(options.output, tplHtml, 'utf8');
  } else {
    fs.writeFileSync(path.resolve(path.dirname(outputOptions.file), "index.html"), tplHtml, 'utf8');
  }

  const bundle = await rollup.rollup(inputOptions);
  const { output } = await bundle.generate(outputOptions);

  await bundle.write(outputOptions);
}

module.exports = {
  lint,
  list,
  htmlBundle
};
