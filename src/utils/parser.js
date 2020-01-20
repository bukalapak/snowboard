import uriTpl from "uritemplate";
import { read } from "../internal/input";
import { parse, fromRefract } from "../parser";

export async function readAsElement(input) {
  return fromRefract(await readAsRefract(input));
}

export async function readAsRefract(input) {
  return parse(await read(input));
}

export async function readMultiAsElement(inputs) {
  return Promise.all(inputs.map(v => readAsElement(v)));
}

export function toValue(data) {
  try {
    return data && data.toValue();
  } catch (_) {
    return undefined;
  }
}

export function toDescription(element) {
  if (!element.copy) return "";
  return toValue(element.copy).join("\n");
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

export function transitionPath(transition, resource) {
  return toValue(transition.computedHref || resource.href);
}
