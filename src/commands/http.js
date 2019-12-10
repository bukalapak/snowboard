import { httpBundle } from "./helper/bundle";

export default async function httpCmd(input, cmd, commander) {
  await httpBundle(input, cmd, { watch: commander.watch });
}
