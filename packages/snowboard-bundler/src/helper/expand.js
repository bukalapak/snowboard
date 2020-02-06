import { reduce, isUndefined } from "lodash";
import minim, { JSON06Serialiser } from "minim";
import eidolon from "eidolon";

const refract06Serializer = new JSON06Serialiser();

export function expand(element, structures) {
  if (isUndefined(element) || !element instanceof minim.Element) {
    return undefined;
  }

  const el = refract06Serializer.serialise(element.content);
  return eidolon.dereference(el, structures);
}

export function normalizeStructures(dataStructures) {
  dataStructures = isUndefined(dataStructures) ? [] : dataStructures;

  const structures = [];

  if (dataStructures instanceof minim.ArraySlice) {
    dataStructures.map(ds => {
      ds.map(d => {
        structures.push(refract06Serializer.serialise(d.content));
      });
    });
  }

  return reduce(
    structures,
    (result, dataStructure) => {
      if (typeof dataStructure.meta.id === "object") {
        result[dataStructure.meta.id.content] = dataStructure;
      } else {
        result[dataStructure.meta.id] = dataStructure;
      }

      return result;
    },
    {}
  );
}
