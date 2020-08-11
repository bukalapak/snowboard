import { toSlug, toValue, toPath, transitionHref } from "snowboard-helper";
import { resourceTitle } from "./transform";

const permalinkPrefix = {
  group: "g",
  resource: "r",
  transition: "t",
};

export function groupPermalink(group) {
  const title = toValue(group.title);
  return toSlug(`${permalinkPrefix.group} ${title}`);
}

export function resourcePermalink(resource, group) {
  if (group) {
    const groupTitle = toValue(group.title);
    const title = resourceTitle(resource);
    return toSlug(`${permalinkPrefix.resource} ${groupTitle} ${title}`);
  }

  const title = resourceTitle(resource);
  return toSlug(`${permalinkPrefix.resource} ${title}`);
}

export function transitionPermalink(transition, resource, group) {
  const method = toValue(transition.method);
  const path = transitionHref(transition, resource);
  const pathTransformed = toPath(path);
  const resTitle = resourceTitle(resource);

  if (group) {
    const groupTitle = toValue(group.title);
    return toSlug(
      `${permalinkPrefix.transition} ${groupTitle} ${resTitle} ${method} ${pathTransformed}`
    );
  }

  return toSlug(
    `${permalinkPrefix.transition} ${resTitle} ${method} ${pathTransformed}`
  );
}
