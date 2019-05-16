const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js");
const slugify = require("slugify");
const glob = require("glob");
const mkdirp = require("mkdirp");
const tmp = require("tmp");
const util = require("util");
const { trimEnd, forEach, reject, isEmpty, values } = require("lodash");
const { table, getBorderCharacters } = require("table");
const { inspect, populate } = require("./adapter");

const globAsync = util.promisify(glob);
const mkdirpAsync = util.promisify(mkdirp);

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
  const data = result.annotations.map(el => {
    const index = reject(
      el.attributes
        .findRecursive("number")
        .map(item => values(item.attributes.toValue())),
      isEmpty
    );

    return [
      index.map(arr => `line ${arr[0]}, column ${arr[1]}`).join(" - "),
      el.classes.toValue(),
      el.content
    ];
  });

  data.unshift(["Location", "Severity", "Description"]);
  console.log(table(data, tableConfig));
}

async function list(result) {
  const items = await populate(result);

  items.forEach(item => {
    console.log([item.method, item.statusCode, item.path].join("\t"));
  });
}

function parameterize(str) {
  try {
    return slugify(str, { lower: true });
  } catch (err) {
    return "";
  }
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

function templateFile(name) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  return path.resolve(__dirname, "..", "..", "templates", "alpha.html.hbs");
}

async function htmlSingle(result, options) {
  const view = await inspect(result);
  const tplFile = templateFile(options.template);

  if (!fs.lstatSync(tplFile).isFile()) {
    console.error(`${tplFile} is not valid template`);
    process.exit(1);
  }

  const template = templateHtml(tplFile);
  return template(view);
}

function templateDir(name) {
  if (name) {
    return path.resolve(process.cwd(), name);
  }

  return path.resolve(__dirname, "..", "..", "templates", "alpha");
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
  const view = await inspect(result);
  const partials = {};
  const tplDir = templateDir(options.template);
  const output = outputDir(options.output);

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
    partials[name] = template(view);
  });

  templateFiles.forEach(file => {
    const name = trimEnd(path.basename(file), ".html.hbs");

    if (name === "index") {
      const template = templateHtml(file, partials);
      const data = template(view);

      writeOutput(path.join(output, "index.html"), data);
    }

    if (name === "resource-group") {
      forEach(view.resourceGroups, group => {
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
  htmlMulti
};
