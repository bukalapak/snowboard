import { resolve } from "path";
import { isEmpty } from "lodash";
import { tmpDir as tmpdir, mkdirp, copyFiles } from "../../internal/util";

export function templatePath(cmd, defaultTemplate) {
  if (cmd.template) {
    return resolve(process.cwd(), cmd.template);
  }

  return defaultTemplate;
}

const defaultOutputDir = resolve(process.cwd(), "./dist");

function outputDir(cmd) {
  if (cmd.output) {
    return resolve(process.cwd(), cmd.output);
  }

  return defaultOutputDir;
}

export async function outputPath(cmd) {
  const outDir = outputDir(cmd);
  const tmpDir = resolve(outDir, "tmp");

  await mkdirp(tmpDir);
  await mkdirp(resolve(outDir, "html"));

  const buildDir = await tmpdir({ dir: tmpDir, prefix: "build-" });

  return [outDir, buildDir];
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
  return copyFiles(source, resolve(buildDir, target));
}
