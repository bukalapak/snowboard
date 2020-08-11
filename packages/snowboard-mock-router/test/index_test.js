import test from "tape";
import degit from "degit";
import { resolve } from "path";
import { readFileSync } from "fs";
import { parse, fromRefract } from "snowboard-parser";
import mockRouter from "../src";

async function loadFixture(filename) {
  const fixtureDir = resolve(__dirname, `./fixtures`);
  const emitter = degit("github:apiaryio/api-blueprint", {
    force: true,
  });

  await emitter.clone(fixtureDir);
  return readFileSync(resolve(fixtureDir, `examples/${filename}`), "utf8");
}

test("router", async (t) => {
  const source = await loadFixture("Gist Fox API.md");
  const result = await parse(source);
  const element = await fromRefract(result);
  const router = mockRouter([element]);

  const routes = router.stack
    .filter((r) => r.route)
    .map((r) => {
      return [
        Object.keys(r.route.methods).join(",").toUpperCase(),
        r.route.path,
      ].join(" ");
    });

  const expected = [
    "GET /gists/:id",
    "PATCH /gists/:id",
    "DELETE /gists/:id",
    "GET /gists",
    "POST /gists",
    "PUT /gists/:id/star",
    "DELETE /gists/:id/star",
    "GET /gists/:id/star",
    "GET /",
  ];

  t.deepEqual(routes, expected);
  t.end();
});
