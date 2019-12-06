import { parse, validate } from "protagonist";
import { Namespace } from "api-elements";

const namespace = new Namespace();
const fromRefract = result => {
  return namespace.fromRefract(result);
};

export { parse, validate, fromRefract };
