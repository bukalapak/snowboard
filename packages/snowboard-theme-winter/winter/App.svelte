<script>
  import { Link } from "yrv";
  import { toNavigation } from "snowboard-theme-helper";
  import { getEnv, getDarkMode } from "snowboard-theme-helper";

  import { toHref, toPermalink } from "./lib/helper";
  import { env, auth, token, darkMode } from "./lib/store";

  import Router from "./Router.svelte";
  import ThemeButton from "./components/ThemeButton.svelte";
  import EnvButton from "./components/EnvButton.svelte";
  import SearchButton from "./components/SearchButton.svelte";
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
    toc: descriptionToc
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
  }

  let isDarkMode = getDarkMode() || false;

  if ($darkMode != isDarkMode) {
    darkMode.set(isDarkMode);

    if (isDarkMode) {
      document.getElementById(`bulma-theme-light`).media = "none";
      document.getElementById(`bulma-theme-dark`).media = "";
      document.getElementById(`prism-theme-light`).media = "none";
      document.getElementById(`prism-theme-dark`).media = "";
    }
  }
</script>

<style>
  .main {
    padding: 2rem 3rem;
    background-color: #fff;
  }

  .is-darkmode .main {
    background-color: #141414;
  }

  .icon-brand {
    margin-right: 0.5rem;
  }

  :global(html) {
    height: 100%;
  }

  :global(body) {
    min-height: 100%;
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
      <a href="/" class="navbar-item">
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
        <div class="navbar-item has-dropdown is-hoverable">
          <SearchButton />
        </div>
        <div class="navbar-item has-dropdown is-hoverable">
          <ThemeButton />
        </div>
      </div>
    </div>
  </nav>

  <div class="main">
    <div class="columns">
      <div class="column is-one-quarter">
        <aside class="menu">
          <Navigation {navigation} />
        </aside>
      </div>

      <div class="column is-three-quarters">
        <Router {title} {description} {groups} {resources} {uuids} />
      </div>
    </div>
  </div>

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
