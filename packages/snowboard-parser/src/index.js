import { parse, validate } from "protagonist";
import { Namespace } from "api-elements";

const namespace = new Namespace();

const fromRefract = result => {
  return namespace.fromRefract(result);
};

const toRefract = element => {
  return namespace.toRefract(element);
};

export { parse, validate, fromRefract, toRefract };
