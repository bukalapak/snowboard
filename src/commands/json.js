import { Command, flags } from "@oclif/command";
import { readAsElement, jsonStringify } from "../util";

class JsonCommand extends Command {
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args } = this.parse(JsonCommand);

    if (!flags.output && flags.quiet) {
      this.error("--quiet cannot be used when no --output=");
    }

    const result = await readAsElement(args.input);

    if (!result) {
      this.error(`unable to parse input: ${args.input}`);
    }

    const data = jsonStringify(result, { optimized: flags.optimized });

    if (flags.output) {
      await writeFile(flags.output, data);
    } else {
      this.log(data);
    }

    if (!flags.quiet && flags.output) {
      this.log("%s: API elements JSON has been saved", flags.output);
    }
  }
}

JsonCommand.description = `render API elements json`;

JsonCommand.flags = {
  output: flags.string({ char: "o", description: "output file" }),
  optimized: flags.boolean({ char: "O", description: "optimized mode" }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default JsonCommand;
