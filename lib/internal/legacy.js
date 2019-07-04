const slugify = require("slugify");
const { trimEnd, isEqual, sortBy, isString, isEmpty, get } = require("lodash");

function parameterize(str) {
  try {
    return slugify(str, { lower: true });
  } catch (err) {
    return "";
  }
}

function stringify(data, contentType) {
  if (isString(data)) {
    return data;
  }

  if (contentType && contentType.match("json")) {
    return JSON.stringify(data, null, "  ");
  }

  return data;
}

function adjustActions(actions, tag, child) {
  return actions.map(action => {
    return {
      title: action.title,
      nestedTitle: [tag.title, child.title, action.title].join(" / "),
      description: action.description,
      method: action.method.toUpperCase(),
      href: action.path,
      hrefVariables: action.parameters.map(params => {
        return {
          title: params.name,
          description: params.description,
          key: params.name,
          value: params.example,
          required: params.required,
          members: params.schema.enum
        };
      }),
      transactions: action.transactions.map(transaction => {
        return {
          title: transaction.title,
          nestedTitle: [
            tag.title,
            child.title,
            action.title,
            transaction.title
          ].join(" / "),
          request: {
            title: transaction.request.title,
            description: transaction.request.description,
            method: action.method.toUpperCase(),
            href: action.path,
            contentType: transaction.request.contentType,
            headers: transaction.request.headers.map(header => {
              return { key: header.name, value: header.example };
            }),
            messageBody: stringify(
              transaction.request.example,
              transaction.request.contentType
            ),
            messageBodySchema: stringify(
              transaction.request.schema,
              "application/json"
            )
          },
          response: {
            title: transaction.response.title,
            description: transaction.response.description,
            contentType: transaction.response.contentType,
            statusCode: transaction.response.statusCode,
            headers: transaction.response.headers.map(header => {
              return { key: header.name, value: header.example };
            }),
            messageBody: stringify(
              transaction.response.example,
              transaction.response.contentType
            ),
            messageBodySchema: stringify(
              transaction.response.schema,
              "application/json"
            )
          }
        };
      })
    };
  });
}

function adjust(result) {
  const server = result.servers[0] && result.servers[0].url;
  const host = trimEnd(server, "/");
  const resourceGroups = [];

  sortBy(result.tags, "title").forEach(tag => {
    if (isEmpty(tag.children)) {
      tag = { title: undefined, description: "", children: [tag] };
    }

    resourceGroups.push({
      title: tag.title,
      description: tag.description,
      metadata: {
        host
      },
      resources: sortBy(tag.children, "title").map(child => {
        return {
          title: child.title,
          nestedTitle: [tag.title, child.title].join(" / "),
          description: child.description,
          transitions: adjustActions(
            result.actions.filter(action => {
              return isEqual(
                parameterize(action.tags.join("/")),
                parameterize([tag.title, child.title].join("/"))
              );
            }),
            tag,
            child
          )
        };
      })
    });
  });

  return {
    title: result.title,
    description: result.description,
    metadata: {
      host
    },
    resourceGroups
  };
}

module.exports = {
  adjust,
  parameterize
};
