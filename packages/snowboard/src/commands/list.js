import { Command, flags } from "@oclif/command";
import { flatten } from "lodash";
import { jsonStringify, borderlessTable, spinner } from "snowboard-helper";
import { loadMulti } from "../helper";
import { list } from "../parser";

class ListCommand extends Command {
  static strict = false;
  static usage = "list INPUT [INPUTS...]";
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, argv } = this.parse(ListCommand);

    const items = await spinner(loadMulti(argv), "Parsing input(s)", {
      success: "Input(s) parsed",
      quiet: flags.quiet,
    });

    const listed = flatten(items.map((item) => list(item)));

    if (flags.json) {
      this.log(jsonStringify(listed, flags.optimized));
      this.exit();
    }

    const data = listed
      .map(({ method, path, statusCode }) => {
        return [method, path, statusCode];
      })
      .sort((a, b) => a[1].localeCompare(b[1]));

    data.unshift([, , ,]);
    this.log(borderlessTable(data));
  }
}

ListCommand.description = `list API routes`;

ListCommand.flags = {
  json: flags.boolean({ char: "j", description: "json mode" }),
  optimized: flags.boolean({
    char: "O",
    description: "optimized mode",
    dependsOn: ["json"],
  }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" }),
};

export default ListCommand;
