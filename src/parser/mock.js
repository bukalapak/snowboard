import { toValue, transformPath } from "../internal/util";

export default function mock(element) {
  const actions = [];

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      actions.push(...mockExtract(resource));
    });
  });

  element.api.resources.forEach(resource => {
    actions.push(...mockExtract(resource));
  });

  return actions;
}

function mockExtract(resource) {
  const data = [];

  resource.transitions.forEach(transition => {
    data.push({
      method: toValue(transition.method),
      path: transformPath(toValue(resource.href || transition.computedHref)),
      requests: transition.transactions.map(({ request }) => {
        return {
          title: toValue(request.title),
          method: toValue(request.method),
          contentType: toValue(request.contentType)
        };
      }),
      responses: transition.transactions.map(({ response }) => {
        return {
          statusCode: toValue(response.statusCode),
          contentType: toValue(response.contentType),
          body: toValue(response.messageBody)
        };
      })
    });
  });

  return data;
}
