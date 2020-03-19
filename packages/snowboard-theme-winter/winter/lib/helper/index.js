import safeStringify from "safe-json-stringify";
import { filter as filterHelper, urlJoin } from "snowboard-theme-helper";
import { sendRequest } from "./request";
import highlight from "./highlight";
import markdown from "./markdown";
import colorize from "./colorize";

export function toHref(permalink, basePath = "/") {
  const char = permalink.substr(0, 1);

  if (char == "/") {
    return permalink;
  }

  return permalink.replace(`${char}~`, `${basePath}${char}/`);
}

export function toPermalink(pathname, basePath = "/") {
  const segment = pathname.replace(basePath, "");
  const char = segment.substr(0, 1);
  return pathname.replace(`${basePath}${char}/`, `${char}~`);
}

export function stringify(obj) {
  if (typeof obj === "string") {
    return obj;
  }

  if (obj) {
    return safeStringify(obj, null, 2);
  }

  return "";
}

export function isAuth(environment, name) {
  return environment.auth && environment.auth.name === name;
}

export function filter(query, groups) {
  return filterHelper(query, groups).map(item => {
    const { permalink, ...rest } = item;

    return {
      ...rest,
      href: toHref(permalink)
    };
  });
}

export function joinHref(href, basePath = "/") {
  return urlJoin(basePath, href);
}

export { highlight, markdown, colorize, sendRequest };
