import { flatten } from "lodash";
import { readMultiAsElement, jsonStringify } from "../internal/util";
import list from "../parser/list";

async function listCmd(inputs, { json }) {
  const items = await readMultiAsElement(inputs);
  const listed = flatten(items.map(item => list(item)));

  if (json) {
    console.log(jsonStringify(listed, { optimized: false }));
    return;
  }

  listed.forEach(({ method, statusCode, path }) => {
    console.log([method, statusCode, path].join("\t"));
  });
}

export default listCmd;
