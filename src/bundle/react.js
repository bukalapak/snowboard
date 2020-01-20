import { resolve } from "path";
import builder from "./builder";

const defaultConfig = { overrides: {} };

export const defaultTemplate = resolve(
  __dirname,
  "../../templates/osaka/index.html"
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
