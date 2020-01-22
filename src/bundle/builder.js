import { resolve, dirname, basename } from "path";
import { merge } from "lodash";
import chokidar from "chokidar";
import jsonBundle from "./json";
import searchConfig from "../internal/config";
import { cp } from "../helper";
import {
  outputPath,
  buildPath,
  copyOverrides,
  writeSeed,
  dirNames
} from "../helper/bundle";
import { readAsElement } from "../helper/parser";
import { spinner } from "../helper/render";
import { seeds as seedBuilder } from "../parser/html";

export default async function(
  input,
  defaultConfig,
  { watch, output, template, optimized, quiet }
) {
  const outDir = await outputPath(output);
  const buildDir = await buildPath(outDir);
  const config = await loadConfig(defaultConfig);
  const templateDir = dirname(template);
  const entrypoint = resolve(buildDir, basename(template));

  const [element, seeds] = await parseInput(input, config, { quiet });

  await cp(templateDir, buildDir);
  await copyOverrides(config.overrides, buildDir);
  await writeSeed(buildDir, seeds, { optimized });
  await writeJSON(element, seeds.uuids, outDir, { optimized });

  if (watch) {
    watchInput(input, config, outDir, buildDir, { optimized, quiet });
    watchTemplate(templateDir, buildDir);
    watchOverrides(config.overrides, buildDir);
  }

  return [entrypoint, outDir];
}

async function loadConfig(defaultConfig) {
  const { html: htmlConfig } = await searchConfig();
  return merge(defaultConfig, htmlConfig);
}

async function parseInput(input, config, { quiet }) {
  const element = await spinner(readAsElement(input), "Parsing input", {
    success: "Input parsed",
    quiet
  });

  const seeds = await seedBuilder(element, { config });

  return [element, seeds];
}

async function writeJSON(element, uuids, outDir, { optimized }) {
  const jsonDir = resolve(outDir, dirNames.json);

  await jsonBundle(element, uuids, jsonDir, { optimized });
  await cp(jsonDir, resolve(outDir, dirNames.jsonHtml));
}

function watchInput(input, config, outDir, buildDir, { optimized, quiet }) {
  const watcher = chokidar.watch(input, {
    persistent: true
  });

  watcher.on("change", async path => {
    const [element, seeds] = await parseInput(path, config, { quiet });

    await writeSeed(buildDir, seeds, { optimized });
    await writeJSON(element, seeds.uuids, outDir, { optimized });
  });

  return watcher;
}

function watchTemplate(tplDir, buildDir) {
  const watcher = chokidar.watch(tplDir, {
    persistent: true
  });

  watcher.on("change", async path => {
    await cp(path, path.replace(tplDir, buildDir));
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

function keyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
