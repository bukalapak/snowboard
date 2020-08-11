import React from "react";
import { compose, mount, route, withView } from "navi";
import { NotFoundError } from "navi";
import { View } from "react-navi";
import { findGroup, findResource } from "snowboard-theme-helper";
import axios from "axios";
import Home from "./pages/Home";
import Group from "./pages/Group";
import Resource from "./pages/Resource";
import Transition from "./pages/Transition";
import Layout from "./components/Layout";
import { toPermalink, basePath } from "./lib/helper";

const jsonBasePath = `${basePath}__json__/`;

const prefix = {
  group: "g",
  resource: "r",
  transition: "t",
};

export async function fetchJSON(uuid) {
  const fullPath = `${jsonBasePath}${uuid}.json`;
  const { data } = await axios.get(fullPath);

  return data;
}

function getResource(ctx, req) {
  const permalink = toPermalink(req.originalUrl);
  return findResource(permalink, ctx.resources, ctx.groups);
}

function routeHome(req, ctx) {
  return {
    title: ctx.title,
    view: (
      <Home
        config={ctx.config}
        title={ctx.title}
        description={ctx.description}
      />
    ),
  };
}

async function routeGroup(req, ctx) {
  const permalink = toPermalink(req.originalUrl);
  const group = findGroup(permalink, ctx.groups);

  if (!group) {
    throw new NotFoundError();
  }

  return {
    title: `${group.title} - ${ctx.title}`,
    view: <Group group={group} />,
  };
}

async function routeResource(req, ctx) {
  const { resource, group } = getResource(ctx, req);

  if (!resource) {
    throw new NotFoundError();
  }

  return {
    title: `${resource.title} - ${ctx.title}`,
    view: <Resource resource={resource} group={group} />,
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
    view: <Transition config={ctx.config} transition={transition} />,
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
    [`${basePath}`]: route(routeHome),
    [`${basePath}${prefix.group}/:id`]: route(routeGroup),
    [`${basePath}${prefix.resource}/:id`]: route(routeResource),
    [`${basePath}${prefix.transition}/:id`]: route(routeTransition),
  })
);
