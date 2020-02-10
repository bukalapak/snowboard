import { resolve, dirname, basename, join as pathJoin } from "path";
import { isEmpty } from "lodash";
import chokidar from "chokidar";
import { spinner } from "snowboard-helper";
import { cp, tmpdir, mkdirp, writeFile, jsonStringify } from "snowboard-helper";
import { seeds as seedBuilder } from "./parser";
import { transitions as transitionsParser } from "./parser";
import { readAsElement } from "./helper";

const dirNames = {
  html: "html",
  jsonHtml: "html/__json__",
  json: "json"
};

export default async function(
  input,
  { config, watch, output, template, optimized, quiet }
) {
  const outDir = await prepareOutput(output);
  const buildDir = await prepareBuild(outDir);

  const templateDir = dirname(template);
  const entrypoint = resolve(buildDir, basename(template));

  const [seeds, transitionSeeds] = await buildSeed(input, config, { quiet });

  await cp(templateDir, buildDir);
  await copyOverrides(config.overrides, buildDir);
  await writeSeed(buildDir, seeds, { optimized });
  await writeJSON(transitionSeeds, seeds.uuids, outDir, { optimized });

  if (watch) {
    watchInput(input, config, outDir, buildDir, { optimized, quiet });
    watchTemplate(templateDir, buildDir);
    watchOverrides(config.overrides, buildDir);
  }

  return [entrypoint, outDir];
}

async function buildSeed(input, config, { quiet }) {
  const element = await spinner(readAsElement(input), "Parsing input", {
    success: "Input parsed",
    quiet
  });

  const seeds = await seedBuilder(element, { config });
  const transitions = transitionsParser(element);

  return [seeds, transitions];
}

async function prepareOutput(output) {
  await mkdirp(resolve(output, dirNames.html));
  await mkdirp(resolve(output, dirNames.jsonHtml));
  await mkdirp(resolve(output, dirNames.json));

  return output;
}

async function prepareBuild(outDir) {
  const tmpDir = resolve(outDir, "tmp");
  await mkdirp(tmpDir);

  const buildDir = await tmpdir({ dir: tmpDir, prefix: "build-" });
  return buildDir;
}

async function writeSeed(buildDir, seeds, { optimized }) {
  const data = `const seeds = ${jsonStringify(seeds, optimized)};
export default seeds;
  `;

  return writeFile(resolve(buildDir, "seeds.js"), data, "utf8");
}

async function copyOverrides(overrides, buildDir) {
  if (!isEmpty(overrides)) {
    for await (let [target, source] of Object.entries(overrides)) {
      if (source) {
        cp(source, resolve(buildDir, target));
      }
    }
  }
}

async function writeJSON(transitionSeeds, uuidMap, outDir, { optimized }) {
  const jsonDir = resolve(outDir, dirNames.json);
  const jsonHtmlDir = resolve(outDir, dirNames.jsonHtml);

  await Promise.all(
    transitionSeeds.map(async transition => {
      const filename = `${uuidMap[transition.permalink]}.json`;

      await writeFile(
        pathJoin(jsonDir, filename),
        jsonStringify(transition, optimized),
        "utf8"
      );
    })
  );

  await cp(jsonDir, jsonHtmlDir);
}

function watchInput(input, config, outDir, buildDir, { optimized, quiet }) {
  const watcher = chokidar.watch(input, {
    persistent: true
  });

  watcher.on("change", async path => {
    const [seeds, transitionSeeds] = await buildSeed(path, config, { quiet });

    await writeSeed(buildDir, seeds, { optimized });
    await writeJSON(transitionSeeds, seeds.uuids, outDir, { optimized });
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
