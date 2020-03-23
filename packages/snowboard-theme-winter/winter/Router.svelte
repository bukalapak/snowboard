<script>
  import { Router, Route, router } from "yrv";
  import axios from "axios";
  import { toNavigation } from "snowboard-theme-helper";
  import { findGroup, findResource, urlJoin } from "snowboard-theme-helper";
  import { toHref, toPermalink } from "./lib/helper";

  import Home from "./pages/Home.svelte";
  import Group from "./pages/Group.svelte";
  import Resource from "./pages/Resource.svelte";
  import Transition from "./pages/Transition.svelte";

  export let title;
  export let description;
  export let groups;
  export let resources;
  export let uuids;
  export let config;

  const jsonPath = "/__json__/";

  const prefix = {
    group: "g",
    resource: "r",
    transition: "t"
  };

  const fetchJSON = async uuid => {
    const fullPath = urlJoin(config.basePath, jsonPath, `${uuid}.json`);
    const { data } = await axios.get(fullPath);

    return data;
  };

  const getGroup = pathname => {
    const permalink = toPermalink(pathname, config.basePath);
    return findGroup(permalink, groups);
  };

  const getResource = pathname => {
    const permalink = toPermalink(pathname, config.basePath);
    return findResource(permalink, resources, groups);
  };

  const getTransition = async pathname => {
    const permalink = toPermalink(pathname, config.basePath);
    const uuid = uuids[permalink];

    if (!uuid) {
      throw new Error("404 - Not Found");
    }

    return await fetchJSON(uuid);
  };
</script>

<!-- Home hack -->
{#if config.basePath == $router.path}
  <Home {title} {description} />
{/if}

<Router path={config.basePath.slice(0, -1)}>
  <!--
  <Route exact>
    <Home {title} {description} />
  </Route>
  -->
  <Route exact path={`/${prefix.group}/:slug`} let:router>
    <Group {config} group={getGroup(router.path)} />
  </Route>
  <Route exact path={`/${prefix.resource}/:slug`} let:router>
    <Resource {config} {...getResource(router.path)} />
  </Route>
  <Route exact path={`/${prefix.transition}/:slug`} let:router>
    {#await getTransition(router.path) then transition}
      <Transition {transition} {config} />
    {/await}
  </Route>
  <Route fallback>404 - Not found</Route>
</Router>
