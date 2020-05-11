<script>
  import { onMount } from "svelte";
  import { navigateTo, router } from "yrv";
  import qs from "querystringify";

  import {
    store,
    getEnv,
    getDarkMode,
    exchangeToken,
    getState,
    clearState,
    getChallengePair,
    clearChallengePair,
    getToken,
    setToken,
    setRefreshToken,
    toNavigation
  } from "snowboard-theme-helper";

  import { toHref, toPermalink, isAuth } from "./lib/helper";
  import { env, auth, token, darkMode } from "./lib/store";

  import Router from "./Router.svelte";
  import ThemeButton from "./components/buttons/ThemeButton.svelte";
  import EnvButton from "./components/buttons/EnvButton.svelte";
  import SearchButton from "./components/buttons/SearchButton.svelte";
  import Navigation from "./components/Navigation.svelte";

  export let title;
  export let description;
  export let descriptionToc;
  export let groups;
  export let resources;
  export let uuids;
  export let config;

  const navigation = toNavigation({
    groups,
    resources,
    title,
    toc: descriptionToc,
    basePath: config.basePath
  });

  if (config.playground.enabled) {
    const savedEnv = getEnv();

    if (
      savedEnv &&
      Object.keys(config.playground.environments).includes(savedEnv)
    ) {
      env.set(savedEnv);
    } else {
      env.set(config.playground.env);
    }

    token.set(getToken($env));
  }

  $: permalink = toPermalink($router.path);
  $: environment =
    config.playground.enabled && config.playground.environments[$env];

  let isDarkMode = getDarkMode() || false;
  let isSearchMode = false;
  let authenticating = false;
  let challengePair = getChallengePair();

  if ($darkMode != isDarkMode) {
    darkMode.set(isDarkMode);

    if (isDarkMode) {
      document.getElementById(`bulma-theme-light`).media = "none";
      document.getElementById(`bulma-theme-dark`).media = "";
      document.getElementById(`prism-theme-light`).media = "none";
      document.getElementById(`prism-theme-dark`).media = "";
    }
  }

  function toggleSearch() {
    isSearchMode = !isSearchMode;
  }

  onMount(async () => {
    if (isAuth(environment, "oauth2")) {
      const authParam = qs.parse(location.search);

      if (authParam.code) {
        authenticating = true;

        const { accessToken, refreshToken } = await exchangeToken({
          code: authParam.code,
          state: getState(),
          clientId: environment.auth.options.clientId,
          tokenUrl: environment.auth.options.tokenUrl,
          callbackUrl: environment.auth.options.callbackUrl,
          codeVerifier: challengePair.codeVerifier
        });

        if (accessToken) {
          setToken($env, accessToken);

          token.set(accessToken);

          if (refreshToken) {
            setRefreshToken($env, refreshToken);
          }
        }

        authenticating = false;
        clearChallengePair();
        clearState();

        const redirectTo = store.get("redirectTo");

        if (redirectTo) {
          navigateTo(redirectTo);
        }
      }
    }
  });

  document.onkeyup = function(e) {
    if ((e.which || e.keyCode) == 27) {
      isSearchMode = false;
    }
  };
</script>

<style>
  .main {
    background-color: #fafafa;
    min-height: 100vh;
  }

  .side-navigation {
    padding: 2rem 1rem 2rem 3rem;
  }

  .main-content {
    padding: 2rem 3rem 2rem 2rem;
    box-shadow: rgb(245, 245, 245) -2px 2px 0px 0px;
  }

  .main-content,
  .footer {
    background-color: #fff;
  }

  .is-darkmode .main-content,
  .is-darkmode .footer {
    background-color: #141414;
  }

  .is-darkmode .main-content {
    box-shadow: -2px 2px 0 0 #363636;
  }

  .is-darkmode .main {
    background-color: #000;
  }

  .icon-brand {
    margin-right: 0.5rem;
  }

  .menu-navigation {
    position: sticky;
    top: 64px;
    overflow-x: auto;
    max-height: 90vh;
  }

  :global(code[class*="language-"], pre[class*="language-"]) {
    background-color: #fff;
    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  }

  :global(.is-darkmode code[class*="language-"], .is-darkmode
      pre[class*="language-"]) {
    background-color: #2b2b2b;
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

  :global(.menu li.is-active) {
    background-color: #3273dc;
    border-radius: 2px;
  }

  :global(.menu li.is-active a) {
    color: #fff;
  }

  :global(.menu li.is-active a:hover) {
    background-color: inherit;
    color: #fff;
  }
</style>

<div class="body-inner" class:is-darkmode={$darkMode}>
  <nav
    class="navbar is-fixed-top has-shadow"
    role="navigation"
    aria-label="main navigation">
    <div class="navbar-brand">
      <a
        href={config.basePath}
        class="navbar-item"
        on:click|preventDefault={() => navigateTo(config.basePath)}>
        <span class="icon icon-brand is-medium has-text-grey-light">
          <i class="fas fa-lg fa-chalkboard" />
        </span>
        <span class="title is-4">{title}</span>
      </a>
    </div>

    <div class="navbar-menu">
      <div class="navbar-end">
        {#if config.playground.enabled}
          <EnvButton playground={config.playground} />
        {/if}
        <div class="navbar-item has-dropdown" class:is-active={isSearchMode}>
          <SearchButton {config} {groups} {toggleSearch} />
        </div>
        <div class="navbar-item has-dropdown is-hoverable">
          <ThemeButton />
        </div>
      </div>
    </div>
  </nav>

  <div class="main">
    <div class="columns">
      <div class="column is-one-quarter side-navigation">
        <aside class="menu menu-navigation">
          <Navigation {navigation} {config} {permalink} />
        </aside>
      </div>

      <div class="column is-three-quarters main-content">
        <Router {title} {description} {groups} {resources} {uuids} {config} />
        <footer class="footer">
          <div class="content column is-paddingless has-text-centered">
            <p>
              <strong>{title}</strong>
              powered by
              <a href="https://github.com/bukalapak/snowboard" target="_blank">
                <strong>Snowboard.</strong>
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</div>
