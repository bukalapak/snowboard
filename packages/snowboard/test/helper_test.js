import test from "tape";
import { parseBinding } from "../src/helper";

test("parseBinding", (t) => {
  t.deepEqual(parseBinding(":8087"), [undefined, 8087]);
  t.deepEqual(parseBinding("localhost:8088"), ["localhost", 8088]);
  t.end();
});
