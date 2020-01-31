import { resolve } from "path";
import { isEmpty } from "lodash";
import { cp, tmpdir, mkdirp, writeFile, jsonStringify } from "./index";

const defaultOutputDir = resolve(process.cwd(), "./dist");

export const dirNames = {
  html: "html",
  jsonHtml: "html/__json__",
  json: "json"
};

function outputDir(output) {
  if (output) {
    return resolve(process.cwd(), output);
  }

  return defaultOutputDir;
}

export async function outputPath(output) {
  const outDir = outputDir(output);

  await mkdirp(resolve(outDir, dirNames.html));
  await mkdirp(resolve(outDir, dirNames.jsonHtml));
  await mkdirp(resolve(outDir, dirNames.json));

  return outDir;
}

export async function buildPath(outDir) {
  const tmpDir = resolve(outDir, "tmp");
  await mkdirp(tmpDir);

  const buildDir = await tmpdir({ dir: tmpDir, prefix: "build-" });
  return buildDir;
}

export async function writeSeed(buildDir, seeds, { optimized }) {
  const data = `const seeds = ${jsonStringify(seeds, optimized)};
export default seeds;
  `;

  return writeFile(resolve(buildDir, "seeds.js"), data, "utf8");
}

export async function copyOverrides(overrides, buildDir) {
  if (!isEmpty(overrides)) {
    for await (let [target, source] of Object.entries(overrides)) {
      if (source) {
        copyOverride(target, source, buildDir);
      }
    }
  }
}

function copyOverride(target, source, buildDir) {
  return cp(source, resolve(buildDir, target));
}
