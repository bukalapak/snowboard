import chokidar from "chokidar";
import { flatten, flattenDeep } from "lodash";
import parseDuration from "parse-duration";

export function watchBuilder(input, options) {
  const opts = {
    persistent: true
  };

  if (options.watchInterval) {
    opts.usePolling = true;
    opts.interval = parseDuration(options.watchInterval);
  }

  let files;

  if (Array.isArray(input)) {
    files = flattenDeep(Array.from(input).map(input => readChildren(input)));
  } else {
    files = readChildren(input);
  }

  return chokidar.watch(files, opts);
}

export default function watchCmd(input, cmd, options, fn) {
  fn(input, cmd);

  if (options.watch) {
    const watcher = watchBuilder(input, options);
    watcher.on("change", () => fn(input, cmd));
  }
}
