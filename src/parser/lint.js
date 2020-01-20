import { reject, values, isEmpty } from "lodash";
import { toValue } from "../utils/parser";

export default function(element) {
  return element.annotations.map(el => {
    const index = reject(
      el.attributes
        .findRecursive("number")
        .map(item => values(toValue(item.attributes))),
      isEmpty
    );

    return {
      location: index.map(arr => ({ line: arr[0], column: arr[1] })),
      severity: toValue(el.classes).join(" "),
      description: el.content
    };
  });
}
