import uriTpl from "uritemplate";

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

export function toHeader(header) {
  return {
    name: toValue(header.key),
    example: toValue(header.value),
    required: false,
    schema: {
      type: "string"
    }
  };
}

function paramLocation(key, path) {
  if (path.includes(`{${key}}`)) {
    return "path";
  }

  return "query";
}

function toRequired(element) {
  if (!element) {
    return false;
  }

  const attrVal = element.attributes.get("typeAttributes");

  if (attrVal) {
    return toValue(attrVal).includes("required");
  }

  if (element.constructor.name === "KeyValuePair") {
    const attrs = element.attributes.content.map(c => toValue(c));
    return !!attrs.find(
      at => at.key === "typeAttributes" && at.value.includes("required")
    );
  }

  return false;
}

function toParameter({ key, val, element, location }) {
  const required = toRequired(element);
  const { enumerations } = toValue(
    element.content && element.content.value.attributes
  );

  return {
    location: location,
    name: toValue(key),
    description: toValue(element.description),
    required,
    example: toValue(val),
    schema: {
      type: toValue(element.title) || "",
      enum: enumerations
    }
  };
}

export function toParameters(element, path) {
  const { hrefVariables } = element;

  if (!hrefVariables) {
    return [];
  }

  return hrefVariables.map((val, key, element) =>
    toParameter({
      key,
      val,
      element,
      location: paramLocation(toValue(key), path)
    })
  );
}

export function resourceTitle(resource) {
  const title = toValue(resource.title);
  if (title) return title;

  return toValue(resource.href);
}

export function transitionTitle(transition) {
  let title = toValue(transition.title);

  if (title === "") {
    title = `${method} ${path}`;
  }

  return title;
}

export function transitionPath(transition, resource) {
  return toValue(transition.computedHref || resource.href);
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
