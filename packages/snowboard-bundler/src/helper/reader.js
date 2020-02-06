import { read } from "snowboard-reader";
import { parse, fromRefract } from "snowboard-parser";

async function readAsRefract(input) {
  return parse(await read(input));
}

export async function readAsElement(input) {
  return fromRefract(await readAsRefract(input));
}
