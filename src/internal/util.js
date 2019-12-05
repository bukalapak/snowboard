import { writeFileSync } from "fs";
import uriTpl from "uritemplate";
import { read } from "./input";
import { load } from "../parser";

export function writeOutput(output, data) {
  if (output) {
    writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

export async function loadRead(input) {
  const source = await read(input);
  const result = await load(source);
  return result;
}

export function transformPath(href) {
  const params = {};
  const uriTemplate = uriTpl.parse(href);

  for (let i = 0; i < uriTemplate.expressions.length; i++) {
    const exp = uriTemplate.expressions[i];

    if (!exp.varspecs) continue;
    if (exp.operator.symbol === "?") continue;

    for (let j = 0; j < exp.varspecs.length; j++) {
      const spec = exp.varspecs[j];
      params[spec.varname] = `{${spec.varname}}`;
    }
  }

  return decodeURIComponent(uriTemplate.expand(params));
}

export function toValue(data) {
  try {
    return data && data.toValue();
  } catch (_) {
    return undefined;
  }
}
