const { promisify } = require("util");
const { first, trimEnd, orderBy } = require("lodash");

const uriTpl = require("uritemplate");

const drafter = require("drafter");
const parseAsync = promisify(drafter.parse);
const validateAsync = promisify(drafter.validate);

const minim = require("minim");
const minimParseResult = require("minim-parse-result");
const minimApiDescription = require("minim-api-description");
const namespace = minim
  .namespace()
  .use(minimParseResult)
  .use(minimApiDescription);

async function parse({ source }) {
  const refract = await parseAsync(source);
  return namespace.fromRefract(refract);
}

async function validate({ source }) {
  const refract = await validateAsync(source);

  if (refract === null) {
    return null;
  }

  return namespace.fromRefract(refract);
}

function toValue(data) {
  try {
    return data && data.toValue();
  } catch (_) {
    return undefined;
  }
}

function toSegment(arr) {
  return arr
    .map(data => {
      return toValue(data);
    })
    .join(" ");
}

function toRequired(attrs) {
  const values =
    attrs &&
    attrs.map((val, key) => {
      if (toValue(key) === "typeAttributes") {
        return first(toValue(val)) === "required";
      }

      return false;
    });

  return first(values) || false;
}

function toVariables(hrefVariables) {
  return (
    hrefVariables &&
    hrefVariables.map((val, key, member) => {
      const { value } = member.content;
      const { enumerations } = toValue(value.attributes);

      return {
        title: toValue(member.title),
        description: toValue(member.description),
        key: toValue(key),
        value: toValue(val),
        required: toRequired(member.attributes),
        members: enumerations
      };
    })
  );
}

function toHref(request, transition, resource) {
  if (request.href) {
    return toValue(request.href);
  }

  if (transition.href) {
    return toValue(transition.href);
  }

  return toValue(resource.href);
}

function inspect(result) {
  const host = toValue(result.api.metadata("HOST"));

  return {
    title: toValue(result.api.title),
    description: toValue(result.api.copy.get(0)),
    metadata: {
      host
    },
    resourceGroups: result.api.resourceGroups.map(group => {
      return {
        title: toValue(group.title),
        description: toValue(group.copy.get(0)),
        metadata: {
          host
        },
        resources: group.resources.map(resource => {
          return {
            title: toValue(resource.title),
            nestedTitle: toSegment([group.title, resource.title]),
            description: toValue(resource.copy.get(0)),
            href: toValue(resource.href),
            hrefVariables: toVariables(resource.hrefVariables),
            transitions: resource.transitions.map(transition => {
              const { hrefVariables } = transition;

              return {
                title: toValue(transition.title),
                nestedTitle: toSegment([
                  group.title,
                  resource.title,
                  transition.title
                ]),
                description: toValue(transition.copy.get(0)),
                method: toValue(transition.method),
                href: toValue(transition.href),
                computedHref: toValue(transition.computedHref),
                hrefVariables: toVariables(hrefVariables),
                data: toValue(transition.data),
                contentTypes: toValue(transition.contentTypes),
                transactions: transition.transactions.map(transaction => {
                  const { request, response } = transaction;

                  return {
                    title: toValue(transaction.title),
                    nestedTitle: toSegment([
                      group.title,
                      resource.title,
                      transition.title,
                      transaction.title
                    ]),
                    authSchemes: toValue(transaction.authSchemes),
                    request: {
                      title: toValue(request.title),
                      method: toValue(request.method),
                      description: toValue(request.copy.get(0)),
                      href: toHref(request, transition, resource),
                      headers: toValue(request.headers),
                      contentType: toValue(request.contentType),
                      messageBody: toValue(request.messageBody),
                      messageBodySchema: toValue(request.messageBodySchema)
                    },
                    response: {
                      statusCode: parseInt(toValue(response.statusCode), 10),
                      description: toValue(response.copy.get(0)),
                      headers: toValue(response.headers),
                      contentType: toValue(response.contentType),
                      messageBody: toValue(response.messageBody),
                      messageBodySchema: toValue(response.messageBodySchema)
                    }
                  };
                })
              };
            })
          };
        })
      };
    })
  };
}

// taken from https://github.com/kminami/apib2swagger/blob/v1.8.0/index.js#L62
function swaggerPathName(uriTemplate) {
  var params = {};

  for (var i = 0; i < uriTemplate.expressions.length; i++) {
    var exp = uriTemplate.expressions[i];

    if (!exp.varspecs) continue;
    if (exp.operator.symbol === "?") continue;

    for (var j = 0; j < exp.varspecs.length; j++) {
      var spec = exp.varspecs[j];
      params[spec.varname] = "{" + spec.varname + "}";
    }
  }

  return decodeURIComponent(uriTemplate.expand(params));
}

function pathName(uriTemplate) {
  return trimEnd(swaggerPathName(uriTemplate), "/ ");
}

async function populate(result) {
  const data = inspect(result);
  const items = [];

  data.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      resource.transitions.forEach(transition => {
        transition.transactions.forEach(transaction => {
          const { request, response } = transaction;
          const { method } = request;
          const {
            contentType,
            statusCode,
            messageBody,
            messageBodySchema
          } = response;

          const path = pathName(uriTpl.parse(request.href));

          items.push({
            method,
            path,
            contentType,
            statusCode,
            messageBody,
            messageBodySchema
          });
        });
      });
    });
  });

  return orderBy(items, ["path", "method", "status"]);
}

module.exports = {
  parse,
  validate,
  inspect,
  populate
};
