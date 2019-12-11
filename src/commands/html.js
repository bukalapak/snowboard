import { htmlBundle } from "./bundle";

export default async function htmlCmd(input, cmd, commander) {
  await htmlBundle(input, cmd, { watch: !!commander.watch });
}
