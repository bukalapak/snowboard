import { read } from "../internal/input";
import { load } from "../parser";
import { writeOutput, readAsElement, jsonStringify } from "../internal/util";

async function jsonCmd(input, { output, quiet }) {
  const result = await readAsElement(input);

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  writeOutput(output, jsonStringify(result, { optimized: false }));

  if (!quiet && output) {
    console.log("%s: API elements JSON has been generated", output);
  }
}

export default jsonCmd;
