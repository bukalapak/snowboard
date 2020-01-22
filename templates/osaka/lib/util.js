export const permalinkPrefix = {
  group: "g",
  resource: "r",
  transition: "t"
};

function toHref(permalink, char) {
  return permalink.replace(`${char}~`, `/${char}/`);
}

export function toGroupHref(permalink) {
  return toHref(permalink, permalinkPrefix.group);
}

export function toResourceHref(permalink) {
  return toHref(permalink, permalinkPrefix.resource);
}

export function toTransitionHref(permalink) {
  return toHref(permalink, permalinkPrefix.transition);
}

function toPermalink(req, char) {
  return req.originalUrl.replace(`/${char}/`, `${char}~`);
}

export function toGroupPermalink(req) {
  return toPermalink(req, permalinkPrefix.group);
}

export function toResourcePermalink(req) {
  return toPermalink(req, permalinkPrefix.resource);
}

export function toTransitionPermalink(req) {
  return toPermalink(req, permalinkPrefix.transition);
}
