import Bundler from "parcel-bundler";
import { resolve, dirname } from "path";
import svelteBundle, { defaultTemplate as svelteTemplate } from "./svelte";
import reactBundle, { defaultTemplate as reactTemplate } from "./react";
import { exists } from "../helper";

const defaultTemplateDir = resolve(__dirname, "../../templates");
const defaultTemplates = {
  [templateName(svelteTemplate)]: svelteTemplate,
  [templateName(reactTemplate)]: reactTemplate
};

async function buildBundler(
  input,
  { watch, output, template, optimized, quiet }
) {
  const [entrypoint, outDir] = await buildTemplate(input, {
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
    production: optimized,
    minify: optimized,
    contentHash: optimized
  };

  return new Bundler(entrypoint, options);
}

function detectTemplate(template) {
  if (!template) {
    return svelteTemplate;
  }

  let tplFile = defaultTemplates[template];

  if (!tplFile) {
    tplFile = resolve(process.cwd(), template);
  }

  return tplFile;
}

function templateName(tplPath) {
  return dirname(tplPath.replace(defaultTemplateDir, "")).substr(1);
}

function buildTemplate(input, { template, ...options }) {
  options.template = detectTemplate(template);

  if (exists(resolve(dirname(options.template), "App.svelte"))) {
    return svelteBundle(input, options);
  }

  return reactBundle(input, options);
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
