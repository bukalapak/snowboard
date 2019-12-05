import { table, getBorderCharacters } from "table";
import { read } from "../internal/input";
import { load } from "../parser";
import lint from "../parser/lint";

const tableConfig = {
  border: getBorderCharacters("ramac")
};

async function lintCmd(input, { quiet, json }) {
  const source = read(input);
  const element = await load(source);
  const result = await lint(element);

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  if (result.length === 0) {
    if (!quiet) {
      console.log("OK");
    }
  } else {
    if (!quiet) {
      const mapResult = lintMap(result);

      if (json) {
        console.log(JSON.stringify(mapResult, null, "  "));
      } else {
        const data = mapResult.map(({ location, severity, description }) => [
          location.join(" - "),
          severity,
          description
        ]);

        data.unshift(["Location", "Severity", "Description"]);
        console.log(table(data, tableConfig));
      }
    }

    return 1;
  }
}

function lintMap(result) {
  return result.map(({ location, severity, description }) => ({
    location: location.map(
      ({ line, column }) => `line ${line}, column ${column}`
    ),

    severity: severity,
    description: description
  }));
}

export default lintCmd;
