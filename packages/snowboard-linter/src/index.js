import { reject, values, isEmpty } from "lodash";
import { validate, fromRefract } from "snowboard-parser";

export default async function (source) {
  const refract = await validate(source);

  if (refract === null) {
    return [];
  }

  const element = fromRefract(refract);

  return element.annotations.map((el) => {
    const index = reject(
      el.attributes
        .findRecursive("number")
        .map((item) => values(toValue(item.attributes))),
      isEmpty
    );

    return {
      location: index.map((arr) => ({ line: arr[0], column: arr[1] })),
      severity: toValue(el.classes).join(" "),
      description: el.content,
    };
  });
}

function toValue(data) {
  try {
    return data && data.toValue();
  } catch (_) {
    return undefined;
  }
}
