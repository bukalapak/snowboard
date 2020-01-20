import { uniq } from "lodash";
import { toValue, transitionPath, transformPath } from "../utils/parser";

export default function list(element) {
  const data = [];

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      data.push(...listExtract(resource));
    });
  });

  element.api.resources.forEach(resource => {
    data.push(...listExtract(resource));
  });

  return data;
}

function listExtract(resource) {
  const data = [];

  resource.transitions.forEach(transition => {
    const path = transitionPath(transition, resource);

    data.push({
      method: toValue(transition.method),
      path: transformPath(path),
      statusCode: uniq(
        transition.transactions.map(({ response }) =>
          toValue(response.statusCode)
        )
      )
    });
  });

  return data;
}
