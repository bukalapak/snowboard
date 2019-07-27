const moduleName = "snowboard";
const cosmiconfig = require("cosmiconfig");
const explorer = cosmiconfig(moduleName, {
  loaders: {
    ".json": cosmiconfig.loadJson,
    ".yaml": cosmiconfig.loadYaml,
    ".yml": cosmiconfig.loadYaml
  }
});

async function load(file) {
  if (!file) return {};
  const { config = {} } = await explorer.load(file);
  return config;
}

module.exports = {
  load
};
