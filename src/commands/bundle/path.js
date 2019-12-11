import { resolve } from "path";
import { tmpDir as tmpdir, mkdirp } from "../../internal/util";

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
