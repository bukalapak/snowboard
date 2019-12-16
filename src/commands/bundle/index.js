import Bundler from "parcel-bundler";
import { resolve, dirname } from "path";
import svelteBundle, { defaultTemplate as svelteTemplate } from "./svelte";
import reactBundle, { defaultTemplate as reactTemplate } from "./react";
import { existsSync } from "fs";

async function buildBundler(input, cmd, { watch }) {
  const [entrypoint, outDir] = await buildTemplate(input, cmd, { watch });

  const htmlDir = resolve(outDir, "html");
  const cacheDir = resolve(outDir, "cache");
  const optimized = !!cmd.optimized;

  const options = {
    outDir: htmlDir,
    cacheDir: cacheDir,
    watch,
    autoInstall: false,
    sourceMaps: !optimized,
    production: optimized,
    minify: optimized,
    contentHash: optimized
  };

  return new Bundler(entrypoint, options);
}

function buildTemplate(input, cmd, options) {
  if (!cmd.template || cmd.template === "osaka") {
    return reactBundle(input, cmd, options);
  }

  if (cmd.template === "winter") {
    return svelteBundle(input, cmd, options);
  }

  const tplFile = resolve(process.cwd(), cmd.template);

  if (existsSync(resolve(dirname(tplFile), "App.svelte"))) {
    return svelteBundle(input, cmd, options);
  }

  return reactBundle(input, cmd, options);
}

export async function htmlBundle(input, cmd, options) {
  const bundler = await buildBundler(input, cmd, options);
  return bundler.bundle();
}

export async function httpBundle(input, cmd, options) {
  const bundler = await buildBundler(input, cmd, options);
  return bundler.serve();
}
