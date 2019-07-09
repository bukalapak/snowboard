const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js");
const glob = require("glob");
const mkdirp = require("mkdirp");
const tmp = require("tmp");
const util = require("util");
const { trimEnd, forEach } = require("lodash");
const { table, getBorderCharacters } = require("table");
const { adjust, parameterize } = require("./legacy");

const rollup = require("rollup");
const svelte = require("rollup-plugin-svelte");
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

const globAsync = util.promisify(glob);
const mkdirpAsync = util.promisify(mkdirp);

const defaultTemplateDir = path.resolve(__dirname, "..", "..", "templates");
const tableConfig = {
  border: getBorderCharacters("ramac")
};

const md = new MarkdownIt({
  html: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (_) {
        return "";
      }
    }

    return "";
  }
});

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

function templateHtml(tplPath, partials) {
  const tplStr = fs.readFileSync(tplPath, "utf8");
  const handlebars = Handlebars.create();

  handlebars.registerHelper("markdownize", str => str && md.render(str));
  handlebars.registerHelper("parameterize", str => parameterize(str));
  handlebars.registerHelper("alias", str =>
    str && str.match("json") ? "json" : ""
  );
  handlebars.registerHelper("colorize", val => {
    switch (val) {
      case "GET":
        return "green";
      case "POST":
        return "blue";
      case "PUT":
        return "teal";
      case "PATCH":
        return "violet";
      case "DELETE":
        return "red";
      case 200:
      case 201:
      case 202:
      case 204:
        return "blue";
      case 401:
      case 403:
      case 404:
      case 422:
        return "orange";
      case 500:
        return "red";
      default:
        return "";
    }
  });

  forEach(partials, (val, key) => {
    handlebars.registerPartial(key, val);
  });

  return handlebars.compile(tplStr, {
    preventIndent: true
  });
}

function templateFile(name, legacy) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  if (legacy) {
    return path.resolve(defaultTemplateDir, "alpha.html.hbs");
  }

  return path.resolve(defaultTemplateDir, "winter.html");
}

function writeTmp(data) {
  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, data, 'utf8');

  return tmpFile.name;
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

async function htmlSingle(result, options) {
  const tplFile = templateFile(options.template, options.legacy);

  if (!fs.lstatSync(tplFile).isFile()) {
    console.error(`${tplFile} is not valid template`);
    process.exit(1);
  }

  if (options.legacy) {
    const template = templateHtml(tplFile);
    return template(adjust(result));
  }
}

function templateDir(name, legacy) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  if (legacy) {
    return path.resolve(defaultTemplateDir, "alpha");
  }

  return path.resolve(defaultTemplateDir, "winter");
}

function outputDir(name) {
  if (name) {
    return path.resolve(name);
  }

  return tmp.dirSync().name;
}

function writeOutput(output, data) {
  if (output) {
    fs.writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

async function htmlMulti(result, options) {
  const partials = {};
  const tplDir = templateDir(options.template, options.legacy);
  const output = outputDir(options.output);

  if (options.legacy) {
    result = adjust(result);
  }

  if (!fs.lstatSync(tplDir).isDirectory()) {
    console.error(`${tplDir} is not valid multi-page templates`);
    process.exit(1);
  }

  await mkdirpAsync(output);

  const assetFiles = await globAsync(path.resolve(tplDir, "*.+(css|js)"));
  const partialFiles = await globAsync(path.resolve(tplDir, "_[^_]*.html.hbs"));
  const inlineFiles = await globAsync(path.resolve(tplDir, "__*.html.hbs"));
  const templateFiles = await globAsync(path.resolve(tplDir, "*.html.hbs"));

  assetFiles.forEach(file => {
    const name = path.basename(file);
    fs.copyFileSync(file, path.join(output, name));
  });

  inlineFiles.forEach(file => {
    const name = trimEnd(path.basename(file), ".html.hbs");
    const template = fs.readFileSync(file, "utf8");
    partials[name] = template;
  });

  partialFiles.forEach(file => {
    const name = trimEnd(path.basename(file), ".html.hbs");
    const template = templateHtml(file);
    partials[name] = template(result);
  });

  templateFiles.forEach(file => {
    const name = trimEnd(path.basename(file), ".html.hbs");

    if (name === "index") {
      const template = templateHtml(file, partials);
      const data = template(result);

      writeOutput(path.join(output, "index.html"), data);
    }

    if (options.legacy && name === "resource-group") {
      forEach(result.resourceGroups, group => {
        const outFile = path.join(output, `${parameterize(group.title)}.html`);
        const template = templateHtml(file, partials);
        const data = template(group);

        writeOutput(outFile, data);
      });
    }
  });

  return output;
}

module.exports = {
  lint,
  list,
  htmlSingle,
  htmlMulti,
  htmlBundle
};
