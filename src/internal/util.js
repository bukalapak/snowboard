import { writeFileSync, writeFile as fsWriteFile } from "fs";
import { promisify } from "util";
import { read } from "./input";
import { parse, fromRefract } from "../parser";
import tmp from "tmp";
import getSlug from "speakingurl";
import xxhash from "xxhashjs";

export { mkdirp, copy as cp, remove as rm } from "fs-extra";

export const writeFile = promisify(fsWriteFile);
export const tmpDir = promisify(tmp.dir);

export function writeOutput(output, data) {
  if (output) {
    writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

export async function readAsElement(input) {
  const result = await readAsRefract(input);
  return fromRefract(result);
}

export async function readAsRefract(input) {
  const source = await read(input);
  return parse(source);
}

export async function readMultiAsElement(inputs) {
  return Promise.all(inputs.map(v => readAsElement(v)));
}

export function toSlug(str) {
  return getSlug(str, {
    separator: "~",
    custom: { _: "~" }
  });
}

export function shortHash(str) {
  return xxhash.h32(str, 0xad1fc).toString(16);
}

export function jsonStringify(data, { optimized = true }) {
  if (optimized) return JSON.stringify(data);
  return JSON.stringify(data, null, "  ");
}
