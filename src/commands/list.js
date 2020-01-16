import { Command, flags } from "@oclif/command";
import { flatten } from "lodash";
import { readMultiAsElement, jsonStringify } from "../util";
import list from "../parser/list";

class ListCommand extends Command {
  static strict = false;
  static usage = "list INPUT [INPUTS...]";
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args, argv } = this.parse(ListCommand);

    const items = await readMultiAsElement(argv);
    const listed = flatten(items.map(item => list(item)));

    if (flags.json) {
      this.log(jsonStringify(listed, { optimized: flags.optimized }));
      this.exit();
    }

    listed.forEach(({ method, statusCode, path }) => {
      this.log([method, statusCode, path].join("\t"));
    });
  }
}

ListCommand.description = `list API routes`;

ListCommand.flags = {
  json: flags.boolean({ char: "j", description: "json mode" }),
  optimized: flags.boolean({
    char: "O",
    description: "optimized mode",
    dependsOn: ["json"]
  }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default ListCommand;
