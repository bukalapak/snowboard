import React from "react";
import { compose, mount, route, withView } from "navi";
import { View } from "react-navi";
import Home from "./pages/Home";
import Group from "./pages/Group";
import Resource from "./pages/Resource";
import Transition from "./pages/Transition";
import Layout from "./components/Layout";

import { fetchJSON } from "./lib/api";

const permalinkPrefix = {
  group: "g",
  resource: "r",
  transition: "t"
};

function getPermalink(req, char) {
  return req.originalUrl.replace(`/${char}/`, `${char}~`);
}

function getGroup(ctx, req) {
  const permalink = getPermalink(req, permalinkPrefix.group);

  return ctx.groups.find(group => {
    return group.permalink == permalink;
  });
}

function getResource(ctx, req) {
  let selected;
  const permalink = getPermalink(req, permalinkPrefix.resource);

  ctx.groups.forEach(group => {
    group.resources.forEach(resource => {
      if (resource.permalink === permalink) {
        selected = resource;
      }
    });
  });

  return selected;
}

async function fetch(ctx, req, char) {
  const permalink = getPermalink(req, char);
  const uuid = ctx.uuids[permalink];
  return fetchJSON(uuid);
}

export default compose(
  withView(() => {
    return (
      <Layout>
        <View />
      </Layout>
    );
  }),
  mount({
    "/": route({
      view: <Home />
    }),
    "/g/:id": route(async (req, ctx) => {
      const group = getGroup(ctx, req);

      return {
        title: group.title,
        view: <Group group={group} />
      };
    }),
    "/r/:id": route(async (req, ctx) => {
      const resource = getResource(ctx, req);

      return {
        title: resource.title,
        view: <Resource resource={resource} />
      };
    }),
    "/t/:id": route(async (req, ctx) => {
      const transition = await fetch(ctx, req, permalinkPrefix.transition);

      return {
        title: transition.title,
        view: <Transition transition={transition} />
      };
    })
  })
);
