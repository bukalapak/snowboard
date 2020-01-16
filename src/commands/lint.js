import { Command, flags } from "@oclif/command";
import { table, getBorderCharacters } from "table";
import { readAsElement, jsonStringify } from "../util";
import lint from "../parser/lint";

const tableConfig = {
  border: getBorderCharacters("ramac")
};

function lintMap(result) {
  return result.map(({ location, severity, description }) => ({
    location: location.map(
      ({ line, column }) => `line ${line}, column ${column}`
    ),

    severity: severity,
    description: description
  }));
}

class LintCommand extends Command {
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args } = this.parse(LintCommand);
    const element = await readAsElement(args.input);
    const result = await lint(element);

    if (!result) {
      this.error(`${input}: unable to parse input`);
    }

    if (result.length === 0) {
      if (!flags.quiet) {
        this.log("OK");
      }
    } else {
      if (!flags.quiet) {
        const mapResult = lintMap(result);

        if (flags.json) {
          this.log(jsonStringify(mapResult, { optimized: flags.optimized }));
        } else {
          const data = mapResult.map(({ location, severity, description }) => [
            location.join(" - "),
            severity,
            description
          ]);

          data.unshift(["Location", "Severity", "Description"]);
          this.log(table(data, tableConfig));
        }
      }

      this.exit(1);
    }
  }
}

LintCommand.description = `validate API blueprint`;

LintCommand.flags = {
  json: flags.boolean({ char: "j", description: "json mode" }),
  optimized: flags.boolean({
    char: "O",
    description: "optimized mode",
    dependsOn: ["json"]
  }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default LintCommand;
