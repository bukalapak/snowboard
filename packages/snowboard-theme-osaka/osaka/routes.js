import React from "react";
import { compose, mount, route, withView } from "navi";
import { NotFoundError } from "navi";
import { View } from "react-navi";
import axios from "axios";
import Home from "./pages/Home";
import Group from "./pages/Group";
import Resource from "./pages/Resource";
import Transition from "./pages/Transition";
import Layout from "./components/Layout";
import { toPermalink } from "./lib/helper";

const basePath = "/__json__/";

const prefix = {
  group: "g",
  resource: "r",
  transition: "t"
};

export async function fetchJSON(uuid) {
  const fullPath = `${basePath}${uuid}.json`;
  const { data } = await axios.get(fullPath);

  return data;
}

function getResource(ctx, req) {
  let selected;
  let selectedGroup;

  const permalink = toPermalink(req.originalUrl);

  ctx.groups.forEach(group => {
    group.resources.forEach(resource => {
      if (resource.permalink === permalink) {
        selected = resource;
        selectedGroup = group;
      }
    });
  });

  if (selected) {
    return [selected, selectedGroup];
  }

  ctx.resources.forEach(resource => {
    if (resource.permalink === permalink) {
      selected = resource;
    }
  });

  return [selected];
}

function routeHome(req, ctx) {
  return {
    title: ctx.title,
    view: <Home title={ctx.title} description={ctx.description} />
  };
}

async function routeGroup(req, ctx) {
  const permalink = toPermalink(req.originalUrl);
  const group = ctx.groups.find(group => {
    return group.permalink == permalink;
  });

  if (!group) {
    throw new NotFoundError();
  }

  return {
    title: `${group.title} - ${ctx.title}`,
    view: <Group group={group} />
  };
}

async function routeResource(req, ctx) {
  const [resource, group] = getResource(ctx, req);

  if (!resource) {
    throw new NotFoundError();
  }

  return {
    title: `${resource.title} - ${ctx.title}`,
    view: <Resource resource={resource} group={group} />
  };
}

async function routeTransition(req, ctx) {
  const permalink = toPermalink(req.originalUrl);
  const uuid = ctx.uuids[permalink];

  if (!uuid) {
    throw new NotFoundError();
  }

  const transition = await fetchJSON(uuid);

  return {
    title: `${transition.title} - ${ctx.title}`,
    view: <Transition config={ctx.config} transition={transition} />
  };
}

export default compose(
  withView((req, ctx) => {
    return (
      <Layout ctx={ctx}>
        <View />
      </Layout>
    );
  }),
  mount({
    [`/`]: route(routeHome),
    [`/${prefix.group}/:id`]: route(routeGroup),
    [`/${prefix.resource}/:id`]: route(routeResource),
    [`/${prefix.transition}/:id`]: route(routeTransition)
  })
);
