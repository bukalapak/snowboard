import { Command, flags } from "@oclif/command";
import { htmlBundle } from "../bundle";

class HtmlCommand extends Command {
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, args } = this.parse(HtmlCommand);

    await htmlBundle(args.input, {
      watch: flags.watch,
      output: flags.output,
      template: flags.template,
      optimized: flags.optimized,
      quiet: flags.quiet
    });
  }
}

HtmlCommand.description = `render HTML documentation`;

HtmlCommand.flags = {
  output: flags.string({ char: "o", description: "output directory" }),
  template: flags.string({ char: "t", description: "custom template" }),
  optimized: flags.boolean({ char: "O", description: "optimized mode" }),
  watch: flags.boolean({
    char: "w",
    description: "watch for the files changes"
  }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default HtmlCommand;
