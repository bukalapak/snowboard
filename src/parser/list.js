import { toValue, transformPath } from "../internal/util";

export default function list(element) {
  const actions = [];

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      actions.push(...listExtract(resource));
    });
  });

  element.api.resources.forEach(resource => {
    actions.push(...listExtract(resource));
  });

  return actions;
}

function listExtract(resource) {
  const data = [];

  resource.transitions.forEach(transition => {
    data.push({
      method: toValue(transition.method),
      statusCode: transition.transactions.map(({ response }) =>
        toValue(response.statusCode)
      ),
      path: transformPath(toValue(resource.href || transition.computedHref))
    });
  });

  return data;
}
