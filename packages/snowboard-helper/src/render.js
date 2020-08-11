import ora from "ora";
import chalk from "chalk";
import prettyTime from "pretty-hrtime";
import { table as tableRender, getBorderCharacters } from "table";

const tableConfig = {
  border: getBorderCharacters("ramac"),
};

const borderlessTableConfig = {
  border: getBorderCharacters("void"),
  drawHorizontalLine: () => {
    return false;
  },
};

export function table(data) {
  return tableRender(data, tableConfig);
}

export function borderlessTable(data) {
  return tableRender(data, borderlessTableConfig);
}

export async function spinner(
  action,
  text,
  { success = "Done", quiet = false }
) {
  if (quiet) {
    return await action;
  }

  const start = process.hrtime();
  const spinner = ora(text);
  spinner.start();

  try {
    const data = await action;
    const end = process.hrtime(start);

    spinner.succeed(chalk.green.bold(` ${success} in ${prettyTime(end)}.`));
    return data;
  } catch (err) {
    spinner.fail(`${text}... ${chalk.red.bold("error")}`);
    throw err;
  }
}
