const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { merge, forEach } = require("lodash");

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

// backward compatibility
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

function loadPartials(source, seeds, inputDir) {
  const handlebars = createHandlebars();
  const regex = /{{> (.+)}}/g;
  const results = matchAll(source, regex);
  const partials = {};

  results.forEach(item => {
    const inputFile = path.resolve(inputDir, item[1]);
    const source = fs.readFileSync(inputFile, "utf8");
    const data = rewriteSource(source);
    const childrenPartials = loadPartials(data, seeds, path.dirname(inputFile));

    forEach(childrenPartials, (val, key) => {
      handlebars.registerPartial(key, val);
      partials[key] = val;
    });

    const template = handlebars.compile(cleanupSource(data), {
      noEscape: true
    });

    partials[item[1]] = template(seeds);
  });

  return partials;
}

function loadSeeds(source, inputDir) {
  const regex = /<!-- seed\((.+)\) -->/g;
  const results = matchAll(source, regex).reverse();
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

// eslint-disable-next-line import/prefer-default-export
function read(input) {
  let source;

  if (input === "-") {
    source = fs.readFileSync("/dev/stdin").toString();
  } else {
    source = fs.readFileSync(input, "utf8");
  }

  const inputDir = detectDir(input);
  return rewriteInput(source, inputDir);
}

module.exports = {
  read
};
