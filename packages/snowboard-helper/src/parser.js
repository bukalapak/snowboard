import uriTpl from "uritemplate";

export function toValue(data) {
  try {
    return data && data.toValue();
  } catch (_) {
    return undefined;
  }
}

export function transitionHref(transition, resource) {
  return toValue(transition.computedHref || resource.href);
}

export function toPath(href) {
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
