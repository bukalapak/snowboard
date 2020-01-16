import { Command, flags } from "@oclif/command";
import { read } from "../internal/input";
import { writeFile } from "../util";

class ApibCommand extends Command {
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args } = this.parse(ApibCommand);

    if (!flags.output && flags.quiet) {
      this.error("--quiet cannot be used when no --output=");
    }

    const source = read(args.input);

    if (flags.output) {
      await writeFile(flags.output, source);
    } else {
      this.log(source);
    }

    if (!flags.quiet && flags.output) {
      this.log("%s: API blueprint has been saved", flags.output);
    }
  }
}

ApibCommand.description = `render API blueprint`;

ApibCommand.flags = {
  output: flags.string({ char: "o", description: "output file" }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default ApibCommand;
