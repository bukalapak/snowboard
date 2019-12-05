import { read } from "../internal/input";
import { writeOutput } from "../internal/util";

async function apibCmd(input, { output, quiet }) {
  const source = read(input);

  writeOutput(output, source);

  if (!quiet && output) {
    console.log("%s: API blueprint has been generated", output);
  }
}

export default apibCmd;
