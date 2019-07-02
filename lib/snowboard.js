const outboard = require("outboard");
const { read } = require("./internal/input");
const {
  lint: renderLint,
  list: renderList,
  htmlSingle: renderHtmlSingle,
  htmlMulti: renderHtmlMulti
} = require("./internal/renderer");

async function lint(input, options = {}) {
  const source = read(input);
  return outboard.lint(source, options);
}

function load(input, options = {}) {
  const source = read(input);
  return outboard.load(source, options);
}

async function json(input, options = {}) {
  const result = await load(input, options);
  return JSON.stringify(result, null, 2);
}

module.exports = {
  parse: outboard.parse,
  validate: outboard.validate,

  read,
  load,
  lint,
  json,

  renderLint,
  renderList,
  renderHtmlSingle,
  renderHtmlMulti
};
