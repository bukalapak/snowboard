import { writeFileSync, writeFile } from "fs";
import { promisify } from "util";
import { read } from "./input";
import { parse, fromRefract } from "../parser";
import tmp from "tmp";
import getSlug from "speakingurl";
import xxhash from "xxhashjs";

export { mkdirp, copy as copyFiles } from "fs-extra";

export const writeFileAsync = promisify(writeFile);
export const tmpDir = promisify(tmp.dir);

export function writeOutput(output, data) {
  if (output) {
    writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

export async function readAsElement(input) {
  const source = await read(input);
  const result = await parse(source);
  return fromRefract(result);
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
