import { read } from "../internal/input";
import { load } from "../parser";
import { writeOutput } from "../internal/util";

async function jsonCmd(input, { output, quiet }) {
  const source = await read(input);
  const result = await load(source);

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  writeOutput(output, JSON.stringify(result, null, 2));

  if (!quiet && output) {
    console.log("%s: API elements JSON has been generated", output);
  }
}

export default jsonCmd;
