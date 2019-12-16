import { resolve } from "path";
import { isEmpty } from "lodash";
import { tmpDir as tmpdir, mkdirp, cp } from "../../internal/util";
import ora from "ora";
import prettyHr from "pretty-hrtime";
import chokidar from "chokidar";

export function templatePath(cmd, defaultTemplate) {
  if (!cmd.template || ["osaka", "winter"].includes(cmd.template)) {
    return defaultTemplate;
  }

  return resolve(process.cwd(), cmd.template);
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
  return cp(source, resolve(buildDir, target));
}

export function keyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

export async function timeSpinner(fn, { start, succeed }) {
  const hrStart = process.hrtime();
  const spinner = new ora({ text: start });
  spinner.start();

  const data = await fn();

  const hrEnd = process.hrtime(hrStart);
  spinner.succeed(`${succeed} (${prettyHr(hrEnd)})`);

  return data;
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
