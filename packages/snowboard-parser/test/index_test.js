import test from "tape";
import { readFileSync } from "fs";
import { resolve } from "path";
import degit from "degit";
import { parse, validate, fromRefract } from "../src";

async function loadFixture(filename) {
  const fixtureDir = resolve(__dirname, `./fixtures`);
  return readFileSync(resolve(fixtureDir, filename), "utf8");
}

async function loadExample(filename) {
  const exampleDir = resolve(__dirname, `./fixtures/api-blueprint`);
  const emitter = degit("github:apiaryio/api-blueprint", {
    force: true,
  });

  await emitter.clone(exampleDir);
  return readFileSync(resolve(exampleDir, `examples/${filename}`), "utf8");
}

test("parse & fromRefract", async (t) => {
  const source = await loadExample("01. Simplest API.md");
  const result = await parse(source);
  const element = fromRefract(result);

  const resource = element.api.resources.first;
  const transition = resource.transitions.first;
  const transaction = transition.transactions.first;

  t.equal(element.api.title.toValue(), "The Simplest API");
  t.equal(element.api.resources.first.href.toValue(), "/message");
  t.equal(transaction.response.statusCode.toValue(), "200");
  t.equal(transition.method.toValue(), "GET");
  t.end();
});

test("validate", async (t) => {
  const source = await loadExample("Gist Fox API.md");
  const result = await validate(source);

  t.equal(result, null);
  t.end();
});

test("validate: invalid apib", async (t) => {
  const source = await loadFixture("blueprint-invalid.apib");
  const result = await validate(source);
  const element = fromRefract(result);
  const annotation = element.annotations.first;

  t.ok(annotation.content.match("unexpected header block"));
  t.equal(annotation.code.toValue(), 5);
  t.end();
});
