<script>
  import { onMount } from "svelte";
  import qs from "querystringify";

  import MenuPanel from "./winter/panels/MenuPanel.svelte";
  import RequestPanel from "./winter/panels/RequestPanel.svelte";
  import ResponsePanel from "./winter/panels/ResponsePanel.svelte";
  import ParameterPanel from "./winter/panels/ParameterPanel.svelte";
  import SelectorPanel from "./winter/panels/SelectorPanel.svelte";
  import PlaygroundPanel from "./winter/panels/PlaygroundPanel.svelte";
  import ScenarioPanel from "./winter/panels/ScenarioPanel.svelte";

  import {
    toc,
    markdown,
    highlight,
    stringify,
    colorize,
    setToken,
    getToken,
    exchangeToken,
    isAuth,
    pushHistory,
    basePath,
    getEnv
  } from "./winter/util.js";

  import { env, auth } from "./winter/store.js";

  export let title;
  export let description;
  export let actions;
  export let tagActions;
  export let config;

  let index = -1;

  function handleClick(event) {
    let target = event.target;

    if (target.nodeName == "SPAN") {
      target = target.parentElement;
    }

    const slug = target.dataset["slug"];
    index = actions.findIndex(el => el.slug === slug);
  }

  function tocClick(event) {
    index = -1;
    let href = event.target.getAttribute("href");
    pushHistory(href);
  }

  $: {
    document.title =
      (currentAction && `${currentAction.title} - ${title}`) || title;
  }

  $: currentAction = actions[index];
  $: environment =
    config.playground.enabled && config.playground.environments[$env];

  if (config.playground.enabled) {
    const savedEnv = getEnv();

    if (!savedEnv) {
      env.set(config.playground.env);
    } else {
      env.set(savedEnv);
    }

    const authToken = getToken($env);

    if (authToken) {
      auth.add($env);
    }
  }

  let showMenu = true;
  let authenticating = false;

  function burgerClick() {
    showMenu = !showMenu;
  }

  function sample(action) {
    return action.transactions[0].request;
  }

  function headersMap(action) {
    return sample(action)
      .headers.filter(header => header.name != "Authorization")
      .map(header => {
        return {
          used: true,
          required: false,
          name: header.name,
          value: header.example || ""
        };
      });
  }

  function parametersMap(action) {
    return action.parameters.map(param => {
      return {
        used: param.required,
        required: param.required,
        name: param.name,
        value: param.example || ""
      };
    });
  }

  function bodyMap(action) {
    const example = sample(action).example;
    return stringify(example);
  }

  onMount(async () => {
    // handle oauth2 callback
    if (isAuth(environment, "oauth2")) {
      const authParam = qs.parse(location.search);

      if (authParam.code) {
        authenticating = true;

        pushHistory(basePath(config));

        const { accessToken } = await exchangeToken(
          authParam.code,
          environment.auth.options
        );

        if (accessToken) {
          setToken($env, accessToken);
          auth.add($env);
        }

        authenticating = false;
      }
    }

    // handle permalink
    const hash = location.hash;

    if (hash.match("#/")) {
      const slug = hash.replace("#/", "");
      index = actions.findIndex(el => el.slug === slug);
    }
  });
</script>

<style>
  .sidenav {
    padding: 1rem 2rem;
  }

  .main {
    padding: 3rem;
    background-color: #fff;
    box-shadow: 0 2px 0 2px #f5f5f5;
  }

  .breadcrumb-right {
    margin-top: 0.3em;
  }

  .box-wrapper {
    border-radius: 0;
  }

  :global(body) {
    background-color: #fafafa;
  }

  :global(code[class*="language-"], pre[class*="language-"]) {
    font-family: monospace;
  }

  :global(.token.number, .token.tag) {
    display: inline;
    padding: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: inherit;
    vertical-align: inherit;
    border-radius: inherit;
    font-weight: inherit;
    white-space: inherit;
    background: inherit;
    margin: inherit;
  }

  .icon-brand {
    margin-right: 0.5rem;
  }
</style>

<nav
  class="navbar is-fixed-top has-shadow"
  role="navigation"
  aria-label="main navigation">
  <div class="navbar-brand">
    <a href="javascript:void(0)" class="navbar-item">
      <span class="icon icon-brand is-medium has-text-grey-light">
        <i class="fas fa-lg fa-chalkboard" />
      </span>
      <span class="title is-4">{title}</span>
    </a>

    <a
      href="javascript:void(0)"
      on:click={burgerClick}
      role="button"
      class="navbar-burger"
      aria-label="menu"
      aria-expanded="false"
      data-target="mainnav">
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </a>
  </div>

  <div class="navbar-menu">
    <div class="navbar-end">
      {#if config.playground.enabled}
        <SelectorPanel
          environments={config.playground.environments}
          {authenticating} />
      {/if}
    </div>
  </div>
</nav>

<div class="columns">
  <div
    class="column is-one-third sidenav"
    class:is-hidden-mobile={showMenu}
    id="mainnav">
    <MenuPanel
      {tagActions}
      tagHeaders={toc(description)}
      currentSlug={currentAction && currentAction.slug}
      actionsCount={actions.length}
      {config}
      {handleClick}
      {tocClick} />
  </div>

  <div class="column is-two-thirds main">
    {#if index === -1}
      <div class="content">
        {@html markdown(description)}
      </div>
    {/if}

    {#if currentAction}
      <div class="columns">
        <div class="column">
          <h1 class="title is-4">{currentAction.title}</h1>
        </div>
        <div class="column">
          <nav
            class="breadcrumb breadcrumb-right is-pulled-right"
            aria-label="breadcrumbs">
            <ul>
              {#each currentAction.tags as tag}
                <li>
                  <a href="javascript:void(0)">{tag}</a>
                </li>
              {/each}
            </ul>
          </nav>
        </div>
      </div>

      <hr />

      <div class="tags has-addons are-large">
        <code class="tag is-uppercase {colorize(currentAction.method)}">
          {currentAction.method}
        </code>
        <code class="tag ">{currentAction.pathTemplate}</code>
      </div>

      <div class="content">
        {@html markdown(currentAction.description)}
      </div>

      {#if config.playground.enabled}
        {#if environment.playground !== false}
          <PlaygroundPanel
            {currentAction}
            environments={config.playground.environments}
            currentSample={sample(currentAction)}
            requestHeaders={headersMap(currentAction)}
            requestParameters={parametersMap(currentAction)}
            requestBody={bodyMap(currentAction)} />
        {/if}
      {/if}

      <ParameterPanel parameters={currentAction.parameters} />

      {#each currentAction.transactions as { request, response }, index}
        <ScenarioPanel
          show={index === 0}
          {request}
          {response}
          {index}
          count={currentAction.transactions.length} />
      {/each}
    {/if}
  </div>
</div>
<footer class="footer">
  <div class="content has-text-centered">
    <p>
      <strong>{title}</strong>
      powered by
      <a href="https://github.com/bukalapak/snowboard" target="_blank">
        <strong>Snowboard.</strong>
      </a>
    </p>
  </div>
</footer>
