import React from "react";
import { compose, mount, route, withView } from "navi";
import { View } from "react-navi";
import Home from "./pages/Home";
import Group from "./pages/Group";
import Resource from "./pages/Resource";
import Transition from "./pages/Transition";
import Layout from "./components/Layout";

import api from "./lib/api";

function buildId(req, char) {
  return req.originalUrl.replace(`/${char}/`, `${char}~`);
}

export default compose(
  withView(async req => {
    return (
      <Layout title={"API"}>
        <View />
      </Layout>
    );
  }),
  mount({
    "/": route({
      getData: () => {
        return api.index();
      },
      view: <Home />
    }),
    "/g/:id": route(async req => {
      const group = await api.page(buildId(req, "g"));

      return {
        view: <Group group={group} />
      };
    }),
    "/r/:id": route(async req => {
      const resource = await api.page(buildId(req, "r"));

      return {
        view: <Resource resource={resource} />
      };
    }),
    "/t/:id": route(async req => {
      const transition = await api.page(buildId(req, "t"));

      return {
        view: <Transition transition={transition} />
      };
    })
  })
);
