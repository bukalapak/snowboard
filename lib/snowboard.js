const { read } = require("./internal/input");
const { parse, validate, inspect, populate } = require("./internal/adapter");

const {
  lint: renderLint,
  list: renderList,
  htmlSingle: renderHtmlSingle,
  htmlMulti: renderHtmlMulti
} = require("./internal/renderer");

async function lint(input) {
  const source = read(input);
  return validate({ source });
}

function load(input) {
  const source = read(input);
  return parse({ source });
}

async function json(input) {
  const result = await load(input);
  return JSON.stringify(result, null, 2);
}

module.exports = {
  parse,
  validate,

  read,
  load,
  lint,
  json,

  populate,
  inspect,

  renderLint,
  renderList,
  renderHtmlSingle,
  renderHtmlMulti
};
