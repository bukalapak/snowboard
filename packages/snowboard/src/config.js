import { cosmiconfig } from "cosmiconfig";

const moduleName = "snowboard";
const explorer = cosmiconfig(moduleName);

export default async function () {
  const { config } = (await explorer.search()) || { config: {} };
  return config;
}
