<script>
  import { Router, Route } from "yrv";
  import axios from "axios";
  import { toNavigation } from "snowboard-theme-helper";
  import { findGroup, findResource } from "snowboard-theme-helper";
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

  const basePath = "/__json__/";

  const prefix = {
    group: "g",
    resource: "r",
    transition: "t"
  };

  const fetchJSON = async uuid => {
    const fullPath = `${basePath}${uuid}.json`;
    const { data } = await axios.get(fullPath);

    return data;
  };

  const getGroup = pathname => {
    const permalink = toPermalink(pathname);
    return findGroup(permalink, groups);
  };

  const getResource = pathname => {
    const permalink = toPermalink(pathname);
    return findResource(permalink, resources, groups);
  };

  const getTransition = async pathname => {
    const permalink = toPermalink(pathname);
    const uuid = uuids[permalink];

    if (!uuid) {
      throw new Error("404 - Not Found");
    }

    return await fetchJSON(uuid);
  };
</script>

<Router>
  <Route exact>
    <Home {title} {description} />
  </Route>
  <Route exact path={`/${prefix.group}/:slug`} let:router>
    <Group group={getGroup(router.path)} />
  </Route>
  <Route exact path={`/${prefix.resource}/:slug`} let:router>
    <Resource {...getResource(router.path)} />
  </Route>
  <Route exact path={`/${prefix.transition}/:slug`} let:router>
    {#await getTransition(router.path) then transition}
      <Transition {transition} />
    {/await}
  </Route>
  <Route fallback>404 - Not found</Route>
</Router>
