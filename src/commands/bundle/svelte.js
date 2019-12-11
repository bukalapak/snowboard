import { read } from "../../internal/input";
import getConfig from "../../internal/config";
import { resolve } from "path";
import outboard, { tagMap } from "outboard";
import { dirname, basename } from "path";
import ora from "ora";
import prettyHr from "pretty-hrtime";
import { copyFiles, writeFileAsync } from "../../internal/util";
import { templatePath, outputPath } from "./path";
import { merge } from "lodash";
import chokidar from "chokidar";

const defaultTemplate = resolve(__dirname, "../templates/winter/index.html");
const defaultHtmlConfig = {
  playground: { enabled: false },
  optimized: false,
  basePath: "/"
};

export default async function(input, cmd, { watch }) {
  const { html: htmlConfig } = await getConfig(cmd.config);

  const config = merge(htmlConfig, defaultHtmlConfig);

  const start = process.hrtime();
  const spinner = new ora({ text: `Processing input: ${input}` });
  spinner.start();

  const source = read(input);
  const result = await outboard.load(source, {}, false);

  const end = process.hrtime(start);
  spinner.succeed(`Input processed in ${prettyHr(end)}`);

  const props = {
    title: result.title,
    description: result.description,
    actions: result.actions,
    tagActions: tagMap(result.tags, result.actions, { sortTags: true }),
    config: config
  };

  const tplJs = `
import App from './App.svelte';

const app = new App({
  target: document.getElementById("root"),
  props: ${JSON.stringify(props)}
});

export default app;
  `;

  const tplFile = templatePath(cmd, defaultTemplate);
  const tplDir = dirname(tplFile);
  const [outDir, buildDir] = await outputPath(cmd);
  const entrypoint = resolve(buildDir, basename(tplFile));

  await copyFiles(tplDir, buildDir);
  await writeFileAsync(resolve(buildDir, "index.js"), tplJs, "utf8");

  if (watch) {
    watchTemplate(tplDir, buildDir);
  }

  return [entrypoint, outDir];
}

function watchTemplate(tplDir, buildDir) {
  const watcher = chokidar.watch(tplDir, {
    persistent: true
  });

  watcher.on("change", async path => {
    await copyFiles(path, path.replace(tplDir, buildDir));
  });

  return watcher;
}
