import { resolve } from "path";
import builder from "./builder";

const defaultConfig = {
  overrides: {},
  playground: { enabled: false },
  optimized: false,
  basePath: "/"
};

export const defaultTemplate = resolve(
  __dirname,
  "../../templates/winter/index.html"
);

export default async function(
  input,
  { watch, output, template, optimized, quiet }
) {
  return builder(input, defaultConfig, {
    watch,
    output,
    template,
    optimized,
    quiet
  });
}
