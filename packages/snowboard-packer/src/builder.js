import { resolve, join as pathJoin } from "path";
import { isEmpty } from "lodash";
import chokidar from "chokidar";
import seedBuilder from "snowboard-seeder";
import { spinner, toc } from "snowboard-helper";
import { read } from "snowboard-reader";
import { parse, fromRefract } from "snowboard-parser";
import { cp, tmpdir, mkdirp, writeFile, jsonStringify } from "snowboard-helper";
import PromisePool from "@supercharge/promise-pool";

export async function setupDir(output) {
  const buildDir = await tmpdir({ prefix: "snowboard-build-" });

  return {
    buildDir,
    outDir: resolve(output),
  };
}

export async function buildSeed(input, config, { quiet }) {
  const element = await spinner(load(input), `Parsing input: ${input}`, {
    success: `Input parsed: ${input}`,
    quiet,
  });

  const { transitions, ...seeds } = await seedBuilder(element, { config });

  seeds.uuids = Object.fromEntries(
    transitions.map(({ permalink, uuid }) => [permalink, uuid])
  );

  seeds.descriptionToc = await toc(seeds.description);

  return [seeds, transitions];
}

export async function writeSeed(buildDir, seeds, { optimized }) {
  const data = `const seeds = ${jsonStringify(seeds, optimized)};
export default seeds;
  `;

  return writeFile(resolve(buildDir, "seeds.js"), data, "utf8");
}

export async function writeJSON(
  outDir,
  transitionSeeds,
  uuidMap,
  { optimized }
) {
  const jsonDir = resolve(outDir, "__json__");

  await mkdirp(jsonDir);
  await PromisePool.withConcurrency(64)
    .for(transitionSeeds)
    .process(async (transition) => {
      const filename = `${uuidMap[transition.permalink]}.json`;

      await writeFile(
        pathJoin(jsonDir, filename),
        jsonStringify(transition, optimized),
        "utf8"
      );
    });
}

export async function copyOverrides(overrides, buildDir) {
  if (!isEmpty(overrides)) {
    for await (let [target, source] of Object.entries(overrides)) {
      if (source) {
        cp(source, resolve(buildDir, target));
      }
    }
  }
}

async function load(input) {
  const source = await read(input);
  const result = await parse(source);

  return fromRefract(result);
}

export function watchTemplate(tplDir, buildDir) {
  const watcher = chokidar.watch(tplDir, {
    persistent: true,
  });

  watcher.on("change", async (path) => {
    await cp(path, path.replace(tplDir, buildDir));
  });

  return watcher;
}

export function watchOverrides(overrides, buildDir) {
  if (isEmpty(overrides)) {
    return null;
  }

  const watcher = chokidar.watch(Object.values(overrides), {
    persistent: true,
  });

  watcher.on("change", async (path) => {
    await cp(path, resolve(buildDir, keyByValue(overrides, path)));
  });

  return watcher;
}

function keyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

export function watchInput(
  input,
  config,
  outDir,
  buildDir,
  { optimized, quiet }
) {
  const watcher = chokidar.watch(input, {
    persistent: true,
  });

  watcher.on("change", async (path) => {
    const [seeds, transitionSeeds] = await buildSeed(path, config, { quiet });

    await writeSeed(buildDir, seeds, { optimized });
    await writeJSON(transitionSeeds, seeds.uuids, outDir, { optimized });
  });

  return watcher;
}
