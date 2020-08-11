import { toValue, toPath, transitionHref } from "snowboard-helper";

export function parse(element) {
  const transitions = [];

  element.api.resourceGroups.forEach((group) => {
    group.resources.forEach((resource) => {
      transitions.push(...extract(resource));
    });
  });

  element.api.resources.forEach((resource) => {
    transitions.push(...extract(resource));
  });

  return transitions;
}

function extract(resource) {
  const data = [];

  resource.transitions.forEach((transition) => {
    const path = transitionHref(transition, resource);

    data.push({
      method: toValue(transition.method),
      path: toPath(path),
      requests: transition.transactions.map(({ request }) => {
        return {
          title: toValue(request.title),
          method: toValue(request.method),
          contentType: toValue(request.contentType),
        };
      }),
      responses: transition.transactions.map(({ response }) => {
        return {
          statusCode: toValue(response.statusCode),
          contentType: toValue(response.contentType),
          body: toValue(response.messageBody),
        };
      }),
    });
  });

  return data;
}
