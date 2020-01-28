import Bundler from "parcel-bundler";
import globby from 'globby';
import builder from "./builder";
import { resolve } from "path";

const defaultConfig = {
  overrides: {},
  playground: { enabled: false }
};

const nodeModules = resolve(__dirname, '../../node_modules');

async function availableTemplates() {
  const glob = await globby(`${nodeModules}/snowboard-theme-**/index.js`);
  return glob.map(g => require(g))
}

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

async function detectTemplate(template) {
  const templates = await availableTemplates();

  if (!template) {
    return templates[0].entrypoint;
  }

  const selected = templates.find(tpl => tpl.name === template);

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
