import { httpBundle } from "./bundle";

export default async function httpCmd(input, cmd, commander) {
  await httpBundle(input, cmd, { watch: !!commander.watch });
}
