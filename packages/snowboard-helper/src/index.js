import {
  writeFile as fsWriteFile,
  readFile as fsReadFile,
  existsSync as exists
} from "fs";
import { promisify } from "util";
import { mkdirp, copy as cp, remove as rm } from "fs-extra";
import tmp from "tmp";
import uuidv4 from "uuid/v4";
import safeStringify from "safe-json-stringify";
import speakingUrl from "speakingurl";

export { table, borderlessTable, spinner } from "./render";
export { toValue, toDescription, toPath, transitionHref } from "./parser";
export { default as toc } from "./toc";

export { mkdirp, exists, cp, rm };

export const writeFile = promisify(fsWriteFile);
export const readFile = promisify(fsReadFile);
export const tmpdir = promisify(tmp.dir);

export function uuid() {
  return uuidv4();
}

export function jsonStringify(data, compact = false) {
  const space = compact ? 0 : 2;
  return safeStringify(data, null, space);
}

export function toSlug(str, separator = "~") {
  return speakingUrl(str, {
    separator,
    custom: { _: separator }
  });
}
