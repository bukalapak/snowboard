import {
  writeFile as fsWriteFile,
  readFile as fsReadFile,
  existsSync as exists
} from "fs";
import { promisify } from "util";
import { mkdirp, copy as cp, remove as rm } from "fs-extra";
import tmp from "tmp";
import uuidv4 from "uuid/v4";
import speakingUrl from "speakingurl";

export { mkdirp, exists, cp, rm };

export const writeFile = promisify(fsWriteFile);
export const readFile = promisify(fsReadFile);
export const tmpdir = promisify(tmp.dir);

export function uuid() {
  return uuidv4();
}

export function jsonStringify(data, compact = false) {
  if (compact) {
    return JSON.stringify(data);
  }

  return JSON.stringify(data, null, "  ");
}

export function toSlug(str) {
  return speakingUrl(str, {
    separator: "~",
    custom: { _: "~" }
  });
}
