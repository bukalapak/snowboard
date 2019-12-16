import cosmiconfig from "cosmiconfig";

const moduleName = "snowboard";
const explorer = cosmiconfig(moduleName, {
  loaders: {
    ".json": cosmiconfig.loadJson,
    ".yaml": cosmiconfig.loadYaml,
    ".yml": cosmiconfig.loadYaml
  }
});

export default async function() {
  const { config } = (await explorer.search()) || { config: {} };
  return config;
}
