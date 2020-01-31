import Bundler from "parcel-bundler";
import builder from "./builder";
import { resolve } from "path";

const templatePrefix = "snowboard-theme-";
const defaultConfig = {
  overrides: {},
  playground: { enabled: false }
};

async function buildBundler(
  input,
  { watch, output, template, optimized, quiet }
) {
  const [entrypoint, outDir] = await builder(input, defaultConfig, {
    watch,
    output,
    template: await detectTemplate(template),
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

  return new Bundler(entrypoint, options);
}

function defaultTemplate() {
  const prefix = new RegExp(templatePrefix);
  const { dependencies } = require("../../package.json");

  return Object.keys(dependencies)
    .find(k => k.match(prefix))
    .replace(prefix, "");
}

async function detectTemplate(template) {
  if (!template) {
    template = defaultTemplate();
  }

  const selected = require(`${templatePrefix}${template}`);

  if (selected) {
    return selected.entrypoint;
  }

  return resolve(process.cwd(), template);
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
