import safeStringify from "safe-json-stringify";
import highlight from "./highlight";
import markdown from "./markdown";
import colorize from "./colorize";

export function toHref(permalink) {
  const char = permalink.substr(0, 1);
  return permalink.replace(`${char}~`, `/${char}/`);
}

export function toPermalink(pathname) {
  const char = pathname.substr(1, 1);
  return pathname.replace(`/${char}/`, `${char}~`);
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

export { highlight, markdown, colorize };
