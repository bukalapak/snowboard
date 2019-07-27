const outboard = require("outboard");
const { read } = require("./internal/input");

async function lint(input, options = {}) {
  const source = read(input);
  return outboard.lint(source, options);
}

function load(input, options = {}) {
  const source = read(input);
  return outboard.load(source, options);
}

module.exports = {
  parse: outboard.parse,
  validate: outboard.validate,

  read,
  load,
  lint
};
