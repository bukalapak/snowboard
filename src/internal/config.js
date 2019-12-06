import cosmiconfig from "cosmiconfig";

const moduleName = "snowboard";
const explorer = cosmiconfig(moduleName, {
  loaders: {
    ".json": cosmiconfig.loadJson,
    ".yaml": cosmiconfig.loadYaml,
    ".yml": cosmiconfig.loadYaml
  }
});

async function autoload(file) {
  if (file) return explorer.load(file);
  return explorer.search();
}

export default async function(file) {
  const { config = {} } = (await autoload(file)) || {};
  return config;
}
