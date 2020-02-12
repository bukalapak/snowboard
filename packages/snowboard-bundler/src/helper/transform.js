import { toValue } from "snowboard-helper";

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

export function transitionTitle({ transition, method, path }) {
  let title = toValue(transition.title);

  if (title === "") {
    title = `${method} ${path}`;
  }

  return title;
}
