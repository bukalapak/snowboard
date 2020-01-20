import { resolve } from "path";
import { isEmpty } from "lodash";
import { mkdirp, copy as cp, remove as rm } from "fs-extra";
import chokidar from "chokidar";

const defaultOutputDir = resolve(process.cwd(), "./dist");

function outputDir(output) {
  if (output) {
    return resolve(process.cwd(), output);
  }

  return defaultOutputDir;
}

export async function outputPath(output) {
  const outDir = outputDir(output);
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
  return cp(source, resolve(buildDir, target));
}

export function watchTemplate(tplDir, buildDir) {
  const watcher = chokidar.watch(tplDir, {
    persistent: true
  });

  watcher.on("change", async path => {
    await cp(path, path.replace(tplDir, buildDir));
  });

  return watcher;
}
