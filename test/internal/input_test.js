import test from "tape";
import { isEqual } from "lodash";
import { readPaths } from "../../src/internal/input";
import { fixturePath } from "../helper";

test("readPaths", async t => {
  const prefix = fixturePath("partials/");
  const paths = await readPaths(fixturePath("partials/API.apib"));

  const actualPaths = paths.map(path => path.replace(`${prefix}/`, ""));
  const expectedPaths = [
    "API.apib",
    "messages/response/seed.json",
    "messages/response/success.apib",
    "messages/actions.apib",
    "messages.apib",
    "users.apib",
    "tasks.apib"
  ];

  t.ok(isEqual(actualPaths, expectedPaths));
  t.end();
});
