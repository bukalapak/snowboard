import { Command, flags } from "@oclif/command";
import { table, jsonStringify } from "snowboard-helper";
import { read } from "snowboard-reader";
import lint from "snowboard-linter";

function lintMap(result) {
  return result.map(({ location, severity, description }) => ({
    severity: severity,
    description: description,
    location: location.map(
      ({ line, column }) => `line ${line}, column ${column}`
    )
  }));
}

class LintCommand extends Command {
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args } = this.parse(LintCommand);
    const source = await read(args.input);
    const result = await lint(source);

    if (result.length === 0) {
      if (!flags.quiet) {
        this.log("OK");
      }
    } else {
      if (!flags.quiet) {
        const mapResult = lintMap(result);

        if (flags.json) {
          this.log(jsonStringify(mapResult, flags.optimized));
        } else {
          const data = mapResult.map(({ location, severity, description }) => [
            location.join(" - "),
            severity,
            description
          ]);

          data.unshift(["Location", "Severity", "Description"]);
          this.log(table(data));
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
