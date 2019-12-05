import test from "tape";
import { readFileSync } from "fs";
import { resolve } from "path";
import degit from "degit";
import { read } from "../src";

const emitter = degit("github:apiaryio/api-blueprint", {
  force: true
});

emitter.clone("test/fixtures/api-blueprint").then(() => {
  console.log("# fixtures\nok api-blueprint");
});

const fixturePath = input => {
  return resolve(__dirname, `fixtures/${input}`);
};

test("read", async t => {
  const source = read(fixturePath("blueprint.apib"));

  t.ok(source.includes("# <API name>"));
  t.ok(source.includes("# Group <resource group name>"));
  t.ok(source.includes("# Data Structures"));
  t.end();
});

test("read with partials", t => {
  const source = read(fixturePath("partials/API.apib"));

  t.ok(source.includes("# API"));
  t.ok(source.includes("# Group Messages"));
  t.ok(source.includes("# Group Users"));
  t.ok(source.includes("# Group Tasks"));
  t.end();
});

test("read with seeds", t => {
  const source = read(fixturePath("seeds/API.apib"));

  t.ok(source.includes("# API"));
  t.ok(source.includes("200"));
  t.ok(source.includes("seeds usage"));
  t.ok(source.includes("user-related"));
  t.end();
});
