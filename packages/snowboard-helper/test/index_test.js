import test from "tape";
import { toSlug } from "../src";

test("toSlug", (t) => {
  t.equal(toSlug("Hello World!"), "hello~world");
  t.equal(toSlug("Hello World!", "/"), "hello/world");
  t.end();
});
