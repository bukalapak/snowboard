import { writeFile as fsWriteFile, readFile as fsReadFile } from "fs";
import { promisify } from "util";
import { mkdirp, copy as cp, remove as rm } from "fs-extra";
import tmp from "tmp";
import UUID from "pure-uuid";

export { mkdirp, cp, rm };

export const writeFile = promisify(fsWriteFile);
export const readFile = promisify(fsReadFile);
export const tmpdir = promisify(tmp.dir);

export function uuid4() {
  return new UUID(4).format();
}

export function jsonStringify(data, compact = false) {
  if (compact) {
    return JSON.stringify(data);
  }

  return JSON.stringify(data, null, "  ");
}
