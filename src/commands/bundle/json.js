import { join as pathJoin } from "path";
import { writeFile, shortHash, jsonStringify } from "../../internal/util";

import htmlParser from "../../parser/html";
import ora from "ora";
import prettyHr from "pretty-hrtime";

export default async function(element, jsonDir, { optimized }) {
  const start = process.hrtime();
  const spinner = new ora({ text: `Parsing element` });
  spinner.start();

  const { index, groups, resources, transitions } = htmlParser(element);

  spinner.text = `Parsing element: writing files`;

  await Promise.all([
    jsonIndex(jsonDir, index, { optimized }),
    ...groups.map(async group => {
      const fname = jsonHash(group.permalink, "g");
      await jsonWrite(jsonDir, fname, group, { optimized });
    }),
    ...resources.map(async resource => {
      const fname = jsonHash(resource.permalink, "r");
      await jsonWrite(jsonDir, fname, resource, { optimized });
    }),
    ...transitions.map(async transition => {
      const fname = jsonHash(transition.permalink, "t");
      await jsonWrite(jsonDir, fname, transition, { optimized });
    })
  ]);

  const end = process.hrtime(start);
  spinner.succeed(`Element parsed in ${prettyHr(end)}`);
}

function jsonHash(permalink, prefix) {
  return `${prefix}~${shortHash(permalink)}.json`;
}

function jsonWrite(jsonDir, filename, data, { optimized }) {
  return writeFile(
    pathJoin(jsonDir, filename),
    jsonStringify(data, { optimized }),
    "utf8"
  );
}

export function jsonIndex(jsonDir, data, options) {
  return jsonWrite(jsonDir, "index.json", data, options);
}
