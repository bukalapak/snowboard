import test from "tape";
import { readFileSync } from "fs";
import { resolve } from "path";
import lint from "../src";

const fixturePath = input => {
  return resolve(__dirname, `./fixtures/${input}`);
};

test("lint", async t => {
  const source = readFileSync(fixturePath("invalid.apib"), "utf8");
  const result = await lint(source);

  t.equal(result.length, 1);
  t.equal(result[0].severity, "warning");
  t.equal(
    result[0].description,
    "unexpected header block, expected a group, resource or an action definition, e.g. '# Group <name>', '# <resource name> [<URI>]' or '# <HTTP method> <URI>'"
  );
  t.equal(
    JSON.stringify(result[0].location),
    '[{"line":4,"column":1},{"line":4,"column":29}]'
  );
  t.end();
});

test("lint (valid fixture)", async t => {
  const source = readFileSync(fixturePath("valid.apib"), "utf8");
  const result = await lint(source);

  t.ok(result.length === 0);
  t.end();
});
