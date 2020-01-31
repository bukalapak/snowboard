import test from "tape";
import { readFileSync } from "fs";
import { resolve } from "path";
import degit from "degit";
import { parse, validate, fromRefract } from "../src";

const fixturePath = input => {
  return resolve(__dirname, `./fixtures/${input}`);
};

const examplePath = input => {
  return fixturePath(`api-blueprint/examples/${input}`);
};

async function setupFixtures() {
  const emitter = degit("github:apiaryio/api-blueprint", {
    force: true
  });

  await emitter.clone(resolve(__dirname, "./fixtures/api-blueprint"));
  console.log("ok fixture: api-blueprint");
}

test("parse & fromRefract", async t => {
  await setupFixtures();

  const source = readFileSync(examplePath("01. Simplest API.md"), "utf8");
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

test("validate", async t => {
  await setupFixtures();

  const source = readFileSync(examplePath("Gist Fox API.md"), "utf8");
  const result = await validate(source);

  t.equal(result, null);
  t.end();
});

test("validate: invalid apib", async t => {
  await setupFixtures();

  const source = readFileSync(fixturePath("blueprint-invalid.apib"), "utf8");
  const result = await validate(source);
  const element = fromRefract(result);
  const annotation = element.annotations.first;

  t.ok(annotation.content.match("unexpected header block"));
  t.equal(annotation.code.toValue(), 5);
  t.end();
});
