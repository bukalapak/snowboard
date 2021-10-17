import { uniq } from "lodash";
import { toValue, toPath, transitionHref } from "snowboard-helper";

export function list(element) {
  const data = [];

  element.api.resourceGroups.forEach((group) => {
    group.resources.forEach((resource) => {
      data.push(...listExtract(resource, group));
    });
  });

  element.api.resources.forEach((resource) => {
    data.push(...listExtract(resource));
  });

  return data;
}

function listExtract(resource, group) {
  return resource.transitions.map((transition) => {
    const href = transitionHref(transition, resource);

    return {
      method: toValue(transition.method),
      path: toPath(href),
      resource: toValue(resource.title),
      group: toValue(group.title),
      statusCode: uniq(
        transition.transactions.map(({ response }) =>
          toValue(response.statusCode)
        )
      ),
    };
  });
}
