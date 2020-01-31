import { toValue, transformPath, transitionPath } from "../helper/parser";

export default function mock(element) {
  const transitions = [];

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      transitions.push(...mockExtract(resource));
    });
  });

  element.api.resources.forEach(resource => {
    transitions.push(...mockExtract(resource));
  });

  return transitions;
}

function mockExtract(resource) {
  const data = [];

  resource.transitions.forEach(transition => {
    const path = transitionPath(transition, resource);

    data.push({
      method: toValue(transition.method),
      path: transformPath(path),
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
