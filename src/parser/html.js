import { merge } from "lodash";
import { uuid4 } from "../helper";
import {
  toValue,
  toDescription,
  groupPermalink,
  resourceTitle,
  resourcePermalink,
  transitionTitle,
  transitionPermalink,
  transitionPath,
  transformPath,
  expand,
  normalizeStructures,
  digParameters,
  digHeaders
} from "../helper/parser";

export function seeds(element, additional = {}) {
  const title = toValue(element.api.title);
  const description = toDescription(element.api);
  const groups = simpleGroups(element);
  const resources = simpleResources(element.api.resources);
  const transitions = simpleTransitions(element);

  return merge(
    {
      title,
      description,
      groups,
      resources,
      transitions,
      uuids: Object.fromEntries(
        transitions.map(transition => [transition.permalink, uuid4()])
      )
    },
    additional
  );
}

function simpleGroups(element) {
  return element.api.resourceGroups.map(group => {
    return {
      title: toValue(group.title),
      permalink: groupPermalink(group),
      resources: simpleResources(group.resources, group)
    };
  });
}

function simpleResources(resources, group) {
  return resources.map(resource => {
    return {
      title: resourceTitle(resource),
      permalink: resourcePermalink(resource, group),
      transitions: resource.transitions.map(transition => {
        return buildSimpleTransition(transition, resource, group);
      })
    };
  });
}

function simpleTransitions(element) {
  const data = [];

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      resource.transitions.forEach(transition => {
        data.push(buildSimpleTransition(transition, resource, group));
      });
    });
  });

  element.api.resources.forEach(resource => {
    resource.transitions.forEach(transition => {
      data.push(buildSimpleTransition(transition, resource));
    });
  });

  return data;
}

function buildSimpleTransition(transition, resource, group) {
  const method = toValue(transition.method);
  const pathTemplate = transitionPath(transition, resource);
  const path = transformPath(pathTemplate);

  return {
    title: transitionTitle(transition),
    permalink: transitionPermalink(transition, resource, group),
    method,
    path,
    meta: buildSimpleMeta(resource, group)
  };
}

export function transitions(element) {
  const data = [];
  const dataStructures = normalizeStructures(element.api.dataStructures);

  element.api.resourceGroups.forEach(group => {
    group.resources.forEach(resource => {
      resource.transitions.forEach(transition => {
        data.push(buildTransition(transition, resource, group, dataStructures));
      });
    });
  });

  element.api.resources.forEach(resource => {
    resource.transitions.forEach(transition => {
      data.push(
        buildTransition(transition, resource, undefined, dataStructures)
      );
    });
  });

  return data;
}

function buildTransition(transition, resource, group, dataStructures) {
  const method = toValue(transition.method);
  const pathTemplate = transitionPath(transition, resource);
  const path = transformPath(pathTemplate);

  return {
    title: transitionTitle(transition),
    description: toDescription(transition),
    permalink: transitionPermalink(transition, resource, group),
    method,
    path,
    pathTemplate,
    parameters: digParameters(path, resource, transition),
    meta: buildMeta(resource, group),
    transactions: transition.transactions.map(
      ({ request: req, response: res }) => {
        return {
          request: {
            method: toValue(req.method),
            contentType: toValue(req.contentType),
            headers: digHeaders(req.headers),
            structure: expand(req.dataStructure, dataStructures),
            body: toValue(req.messageBody),
            schema: toValue(req.messageBodySchema)
          },
          response: {
            statusCode: toValue(res.statusCode),
            contentType: toValue(res.contentType),
            headers: digHeaders(res.headers),
            structure: expand(res.dataStructure, dataStructures),
            body: toValue(res.messageBody),
            schema: toValue(res.messageBodySchema)
          }
        };
      }
    )
  };
}

function buildSimpleMeta(resource, group) {
  const meta = {};

  if (resource) {
    meta.resource = {
      title: resourceTitle(resource),
      permalink: resourcePermalink(resource, group)
    };
  }

  if (group) {
    meta.group = {
      title: toValue(group.title),
      permalink: groupPermalink(group)
    };
  }

  return meta;
}

function buildMeta(resource, group) {
  const meta = buildSimpleMeta(resource, group);

  if (meta.resource) {
    meta.resource.description = toDescription(resource);
  }

  if (meta.group) {
    meta.group.description = toDescription(group);
  }

  return meta;
}
