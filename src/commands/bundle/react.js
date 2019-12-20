import { resolve, dirname, basename } from "path";
import getConfig from "../../internal/config";
import { merge } from "lodash";
import { readAsElement, mkdirp, cp } from "../../internal/util";
import chokidar from "chokidar";
import jsonBundle from "./json";
import { templatePath, outputPath, copyOverrides } from "./common";
import { timeSpinner, watchTemplate, keyByValue } from "./common";
import { toValue } from "../../parser/util";
import { writeFile } from "../../internal/util";

const defaultTemplate = resolve(__dirname, "../templates/osaka/index.html");
const defaultConfig = { overrides: {} };

export default async function(input, cmd, { watch }) {
  const { html: htmlConfig } = await getConfig(cmd.config);

  const config = merge(defaultConfig, htmlConfig);

  const tplFile = templatePath(cmd, defaultTemplate);
  const tplDir = dirname(tplFile);
  const [outDir, buildDir] = await outputPath(cmd);
  const entrypoint = resolve(buildDir, basename(tplFile));

  const element = await parseInput(input);

  const props = {
    title: toValue(element.api.title),
    ...config
  };

  const data = `
const config = ${JSON.stringify(props)};

export default config;
  `;

  await cp(tplDir, buildDir);
  await copyOverrides(config.overrides, buildDir);
  await writeFile(resolve(buildDir, "config.js"), data, "utf8");
  await writeJSON(element, outDir, cmd);

  if (watch) {
    watchInput(input, config, buildDir, outDir, cmd);
    watchTemplate(tplDir, buildDir);
    watchOverrides(config.overrides, buildDir);
  }

  return [entrypoint, outDir];
}

async function parseInput(input) {
  return await timeSpinner(
    async () => {
      const element = await readAsElement(input);

      return element;
    },
    {
      start: `Processing input: ${input}`,
      succeed: `Input processed`
    }
  );
}

async function writeJSON(element, outDir, cmd) {
  const jsonDir = resolve(outDir, "json");

  await mkdirp(jsonDir);
  await jsonBundle(element, jsonDir, { optimized: cmd.optimized });
  await cp(jsonDir, resolve(outDir, "html/__json__"));
}

function watchInput(input, config, buildDir, outDir, cmd) {
  const watcher = chokidar.watch(input, {
    persistent: true
  });

  watcher.on("change", async path => {
    const element = await parseInput(path);
    await writeJSON(element, outDir, cmd);
  });

  return watcher;
}

function watchOverrides(overrides, buildDir) {
  const watcher = chokidar.watch(Object.values(overrides), {
    persistent: true
  });

  watcher.on("change", async path => {
    await cp(path, resolve(buildDir, keyByValue(overrides, path)));
  });

  return watcher;
}
