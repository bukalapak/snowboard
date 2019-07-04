const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { merge, forEach } = require("lodash");

const partialRegex = /{{> (.+)}}/g;
const seedRegex = /<!-- seed\((.+)\) -->/g;

function createHandlebars() {
  const handlebars = Handlebars.create();

  handlebars.registerHelper("join", items => items.join(", "));
  handlebars.registerHelper("upcase", str => str.toUpperCase());

  return handlebars;
}

function matchAll(str, regex) {
  const matches = [];
  let match;

  while ((match = regex.exec(str)) != null) {
    matches.push(match);
  }

  return matches;
}

function detectDir(input) {
  if (input === "-") {
    return process.cwd();
  }

  return path.dirname(input);
}

function rewriteSource(source) {
  const replacement = "{{> $1}}";
  let data = `${source}\n`;

  data = data.replace(/<!-- partial\((.+)\) -->/g, replacement);
  data = data.replace(/<!-- include\((.+)\) -->/g, replacement);
  data = data.replace(/{{\s?partial "(.+)"\s?}}/g, replacement);
  data = data.replace(
    /{{with index \.(.+) "([0-9]+)"}}{{with index \.(.+) "([0-9]+)"}}\s?{{\.(.+)}}\s?{{end}}{{end}}/g,
    "{{$1.$2.$3.$4.$5}}"
  );
  data = data.replace(
    /{{with index \.(.+) "([0-9]+)"}}\s?{{\.(.+)}}\s?{{end}}/g,
    "{{$1.$2.$3}}"
  );
  data = data.replace(
    /{{with index \.(.+) "([0-9]+)"}}\s?{{join \.(.+) ",\s?"}}\s?{{end}}/g,
    "{{$1.$2.$3}}"
  );
  data = data.replace(/{{join .(.+) ",\s?"}}/g, "{{join $1}}");
  data = data.replace(/{{\.(.+) \| upcase}}/g, "{{upcase $1}}");
  data = data.replace(/{{\./g, "{{");

  return data;
}

function cleanupSource(source) {
  return source.replace(/<!-- seed\((.+)\) -->/g, "");
}

function extractPartials(source) {
  return matchAll(source, partialRegex);
}

function extractSeeds(source) {
  return matchAll(source, seedRegex).reverse();
}

function loadPartials(source, seeds, inputDir) {
  const handlebars = createHandlebars();
  const results = extractPartials(source);
  const partials = {};

  results.forEach(item => {
    const inputFile = path.resolve(inputDir, item[1]);
    const source = fs.readFileSync(inputFile, "utf8");
    const sourceDir = path.dirname(inputFile);
    const data = rewriteSource(source);
    const childrenSeeds = loadSeeds(source, sourceDir);
    const childrenPartials = loadPartials(data, seeds, sourceDir);

    forEach(childrenPartials, (val, key) => {
      handlebars.registerPartial(key, val);
      partials[key] = val;
    });

    const template = handlebars.compile(cleanupSource(data), {
      noEscape: true
    });

    merge(seeds, childrenSeeds);
    partials[item[1]] = template(seeds);
  });

  return partials;
}

function loadSeeds(source, inputDir) {
  const results = extractSeeds(source);
  const seeds = {};

  results.forEach(item => {
    const data = JSON.parse(
      fs.readFileSync(path.resolve(inputDir, item[1]), "utf8")
    );
    merge(seeds, data);
  });

  return seeds;
}

function rewriteInput(source, inputDir) {
  const handlebars = createHandlebars();
  const data = rewriteSource(source);
  const seeds = loadSeeds(source, inputDir);
  const partials = loadPartials(data, seeds, inputDir);

  forEach(partials, (val, key) => {
    handlebars.registerPartial(key, val);
  });

  const template = handlebars.compile(cleanupSource(data), { noEscape: true });
  return template(seeds);
}

function resolveFile(input, basedir) {
  const inputFile = path.resolve(basedir, input);
  const inputDir = path.dirname(inputFile);
  const source = rewriteSource(fs.readFileSync(inputFile, "utf8"));

  return [source, inputDir];
}

function extractChildren(source, inputDir, children = []) {
  const sourceClean = rewriteSource(source);
  const partials = extractPartials(sourceClean);
  const seeds = extractSeeds(sourceClean);

  partials.forEach(partial => {
    const [partialSource, partialDir] = resolveFile(partial[1], inputDir);
    extractChildren(partialSource, partialDir, children);
  });

  partials.forEach(item => children.push(path.resolve(inputDir, item[1])));
  seeds.forEach(item => children.push(path.resolve(inputDir, item[1])));
}

function readInput(input) {
  let source;

  if (input === "-") {
    source = fs.readFileSync("/dev/stdin").toString();
  } else {
    source = fs.readFileSync(input, "utf8");
  }

  const inputDir = detectDir(input);
  return [source, inputDir];
}

function read(input) {
  const [source, inputDir] = readInput(input);
  return rewriteInput(source, inputDir);
}

function readChildren(input) {
  const children = [];

  if (input !== "-") {
    children.push(path.resolve(input));
  }

  const [source, inputDir] = readInput(input);

  extractChildren(source, inputDir, children);
  return children;
}

module.exports = {
  read,
  readChildren
};
