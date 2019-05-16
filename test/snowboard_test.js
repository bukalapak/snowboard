const test = require("tape");
const path = require("path");
const { read, load, lint } = require("../lib/snowboard");

const fixturePath = input => {
  return path.resolve(__dirname, `fixtures/${input}`);
};

test("read", t => {
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

test("load", async t => {
  const result = await load(fixturePath("partials/API.apib"));
  const names = result.api.resourceGroups.map(group => group.title.toValue());
  const expected = ["Messages", "Users", "Tasks"];

  t.deepEqual(names, expected, "group names");
  t.end();
});

test("lint", async t => {
  const result1 = await lint(fixturePath("partials/API.apib"));
  t.ok(result1 === null);

  const result2 = await lint(fixturePath("blueprint-invalid.apib"));
  t.ok(result2.annotations.toValue().length === 1);
  t.end();
});
