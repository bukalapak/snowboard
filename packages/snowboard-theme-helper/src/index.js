import speakingUrl from "speakingurl";
import jsonParseSafe from "json-parse-safe";
import clipboardCopyOriginal from "clipboard-copy";

export { toNavigation, filterNavigation } from "./navigation";
export { toTransactions } from "./transactions";

export const jsonParse = jsonParseSafe;
export const clipboardCopy = clipboardCopyOriginal;

export function toSlug(str, separator = "~") {
  return speakingUrl(str, {
    separator,
    custom: { _: separator }
  });
}
