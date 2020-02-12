import { resolve } from "path";
import { merge } from "lodash";
import Bundler from "parcel-bundler";
import bundlerSvelte from "parcel-plugin-svelte";
import builder from "./builder";

const defaultConfig = {
  overrides: {},
  playground: { enabled: false }
};

async function buildBundler(
  input,
  { config, watch, output, template, optimized, quiet }
) {
  const [entrypoint, outDir] = await builder(input, {
    config: merge(defaultConfig, config),
    watch,
    output,
    template,
    optimized,
    quiet
  });

  const htmlDir = resolve(outDir, "html");
  const cacheDir = resolve(outDir, "cache");

  const options = {
    outDir: htmlDir,
    cacheDir: cacheDir,
    watch: !!watch,
    autoInstall: false,
    sourceMaps: false,
    production: !!optimized,
    minify: !!optimized,
    contentHash: !!optimized
  };

  const bundler = new Bundler(entrypoint, options);
  bundlerSvelte(bundler);

  return bundler;
}

export async function htmlBundle(input, options) {
  const bundler = await buildBundler(input, options);
  return bundler.bundle();
}

export async function httpBundle(input, options) {
  const bundler = await buildBundler(input, options);

  if (options.ssl) {
    return bundler.serve(
      options.port,
      { cert: options.cert, key: options.key },
      options.host
    );
  }

  return bundler.serve(options.port, false, options.host);
}
