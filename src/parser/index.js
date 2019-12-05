import { parse, validate } from "protagonist";
import { Namespace } from "api-elements";

const namespace = new Namespace();

const load = async (source, options = {}) => {
  const refract = await parse(source, options);
  return namespace.fromRefract(refract);
};

export {
  load,
  parse,
  validate
}
