import { resolve } from "path";
import degit from "degit";

export const fixturePath = input => {
  return resolve(__dirname, `./fixtures/${input}`);
};

export async function setupFixtures() {
  const emitter = degit("github:apiaryio/api-blueprint", {
    force: true
  });

  await emitter.clone("test/fixtures/api-blueprint");
  console.log("# fixtures\nok api-blueprint");
}
