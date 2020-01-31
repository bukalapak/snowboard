import test from "tape";
import { read } from "../src";
import { fixturePath, setupFixtures } from "./helper";

(async () => {
  await setupFixtures();
})();

test("read", async t => {
  const source = await read(fixturePath("blueprint.apib"));

  t.ok(source.includes("# <API name>"));
  t.ok(source.includes("# Group <resource group name>"));
  t.ok(source.includes("# Data Structures"));
  t.end();
});

test("read with partials", async t => {
  const source = await read(fixturePath("partials/API.apib"));

  t.ok(source.includes("# API"));
  t.ok(source.includes("# Group Messages"));
  t.ok(source.includes("# Group Users"));
  t.ok(source.includes("# Group Tasks"));
  t.end();
});

test("read with seeds", async t => {
  const source = await read(fixturePath("seeds/API.apib"));

  t.ok(source.includes("# API"));
  t.ok(source.includes("200"));
  t.ok(source.includes("seeds usage"));
  t.ok(source.includes("user-related"));
  t.end();
});
