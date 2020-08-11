import { merge } from "lodash";
import {
  uuid,
  toValue,
  toDescription,
  toPath,
  transitionHref,
} from "snowboard-helper";

import {
  groupPermalink,
  resourceTitle,
  resourcePermalink,
  transitionTitle,
  transitionPermalink,
  digParameters,
  digHeaders,
} from "./helper";

export default async function (element, additional = {}) {
  const title = toValue(element.api.title);
  const description = toDescription(element.api);
  const groups = simpleGroups(element);
  const resources = simpleResources(element.api.resources);
  const transitions = buildTransitions(element);

  return merge(
    {
      title,
      description,
      groups,
      resources,
      transitions,
    },
    additional
  );
}

function simpleGroups(element) {
  return element.api.resourceGroups.map((group) => {
    return {
      title: toValue(group.title),
      permalink: groupPermalink(group),
      description: toDescription(group),
      resources: simpleResources(group.resources, group),
    };
  });
}

function simpleResources(resources, group) {
  return resources.map((resource) => {
    return {
      title: resourceTitle(resource),
      permalink: resourcePermalink(resource, group),
      description: toDescription(resource),
      transitions: resource.transitions.map((transition) => {
        return simpleTransition(transition, resource, group);
      }),
    };
  });
}

function simpleTransition(transition, resource, group) {
  const method = toValue(transition.method);
  const pathTemplate = transitionHref(transition, resource);
  const path = toPath(pathTemplate);

  return {
    title: transitionTitle({ transition, method, path }),
    permalink: transitionPermalink(transition, resource, group),
    method,
    path,
    meta: buildMeta(resource, group),
  };
}

function buildTransitions(element) {
  const data = [];

  element.api.resourceGroups.forEach((group) => {
    group.resources.forEach((resource) => {
      resource.transitions.forEach((transition) => {
        data.push(buildTransition(transition, resource, group));
      });
    });
  });

  element.api.resources.forEach((resource) => {
    resource.transitions.forEach((transition) => {
      data.push(buildTransition(transition, resource, undefined));
    });
  });

  return data;
}

function buildTransition(transition, resource, group) {
  const method = toValue(transition.method);
  const pathTemplate = transitionHref(transition, resource);
  const path = toPath(pathTemplate);

  return {
    title: transitionTitle({ transition, method, path }),
    description: toDescription(transition),
    permalink: transitionPermalink(transition, resource, group),
    uuid: uuid(),
    method,
    path,
    pathTemplate,
    parameters: digParameters(path, resource, transition),
    meta: buildMeta(resource, group),
    transactions: transition.transactions.map(
      ({ request: req, response: res }) => {
        return {
          request: {
            title: toValue(req.title),
            description: toDescription(req),
            method: toValue(req.method),
            contentType: toValue(req.contentType),
            headers: digHeaders(req.headers),
            body: toValue(req.messageBody),
            schema: toValue(req.messageBodySchema),
          },
          response: {
            title: toValue(res.title),
            description: toDescription(res),
            statusCode: toValue(res.statusCode),
            contentType: toValue(res.contentType),
            headers: digHeaders(res.headers),
            body: toValue(res.messageBody),
            schema: toValue(res.messageBodySchema),
          },
        };
      }
    ),
  };
}

function buildMeta(resource, group) {
  const meta = {};

  if (resource) {
    meta.resource = {
      title: resourceTitle(resource),
      permalink: resourcePermalink(resource, group),
    };
  }

  if (group) {
    meta.group = {
      title: toValue(group.title),
      permalink: groupPermalink(group),
    };
  }

  return meta;
}
