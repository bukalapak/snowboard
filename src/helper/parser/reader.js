import { read } from "../../internal/input";
import { parse, fromRefract } from "../../parser";

export async function readAsRefract(input) {
  return parse(await read(input));
}

export async function readAsElement(input) {
  return fromRefract(await readAsRefract(input));
}

export async function readMultiAsElement(inputs) {
  return Promise.all(inputs.map(v => readAsElement(v)));
}
