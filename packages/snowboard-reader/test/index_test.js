import test from "tape";
import { resolve } from "path";
import { isEqual } from "lodash";
import { read, extractPaths } from "../src";

const fixturePath = (input) => {
  return resolve(__dirname, `./fixtures/${input}`);
};

test("read", async (t) => {
  const source = await read(fixturePath("blueprint.apib"));

  t.ok(source.includes("# <API name>"));
  t.ok(source.includes("# Group <resource group name>"));
  t.ok(source.includes("# Data Structures"));
  t.end();
});

test("read with partials and seeds", async (t) => {
  const source = await read(fixturePath("api/api.apib"));

  t.ok(source.includes("# API"));
  t.ok(source.includes("# Group Messages"));
  t.ok(source.includes("# Group Users"));
  t.ok(source.includes("# Group Tasks"));

  t.ok(source.includes("200"));
  t.ok(source.includes("seeds usage"));
  t.ok(source.includes("user-related"));

  t.end();
});

test("extractPaths", async (t) => {
  const prefix = fixturePath("api/");
  const paths = await extractPaths(fixturePath("api/api.apib"));

  const actualPaths = paths.map((path) => path.replace(`${prefix}/`, ""));
  const expectedPaths = [
    "api.apib",
    "messages/response/success.apib",
    "messages/actions.apib",
    "messages.apib",
    "users.apib",
    "tasks.apib",
    "seed-user.json",
    "seed.json",
  ];

  t.ok(isEqual(actualPaths, expectedPaths));
  t.end();
});
