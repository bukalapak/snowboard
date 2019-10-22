<script>
  import MenuItem from "../components/MenuItem.svelte";

  import { colorize, slugify, filterActions, basePath } from "../util.js";

  export let config = {};
  export let tagActions = [];
  export let tagHeaders = [];
  export let currentSlug;
  export let actionsCount;
  export let isCollapsed;
  export let isDarkmode;

  export let handleClick;
  export let tocClick;
  export let searchClick;

  let query = "";

  function escape(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  $: regex = new RegExp(escape(query), "gi");
  $: filteredActions = filterActions(tagActions, regex);

  function headerLink(text) {
    return text.toLowerCase().replace(/\s/g, "-");
  }
</script>

<style>
  .hero,
  .menu-wrapper {
    padding: 0 2.75rem 0 2rem;
  }

  .hero {
    position: sticky;
    top: 54px;
    background-color: #fafafa;
    margin-bottom: 1.5rem;
  }

  .hero.is-darkmode {
    background-color: #000;
  }

  .hero-body {
    padding: 1.5rem 0;
    box-shadow: 0 2px 0 0 #f5f5f5;
  }

  .hero-body.is-darkmode {
    box-shadow: 0 2px 0 0 #363636;
  }

  .menu-wrapper::-webkit-scrollbar {
    display: none;
  }

  @media screen and (min-width: 768px) {
    .hero,
    .menu-wrapper {
      width: -moz-calc(25% - 0.5rem);
      width: -webkit-calc(25% - 0.5rem);
      width: -o-calc(25% - 0.5rem);
      width: calc(25% - 0.5rem);
    }

    .hero {
      position: fixed;
      padding: 0 1.25rem;
    }

    .menu-wrapper {
      position: fixed;
      top: 140px;
      padding: 1.5rem 1.25rem 1.25rem;
      height: -moz-calc(100% - 150px - 2.5rem);
      height: -webkit-calc(100% - 150px - 2.5rem);
      height: -o-calc(100% - 150px - 2.5rem);
      height: calc(100% - 150px - 2.5rem);
      overflow: -moz-scrollbars-none;
      -ms-overflow-style: none;
      overflow-x: hidden;
      overflow-y: auto;
      transition: opacity 0.3s, left 0.3s;
    }

    .menu.is-collapsed {
      width: 3rem;
    }

    .is-collapsed .hero,
    .is-collapsed .hero-body {
      width: calc(3rem - 2px);
    }

    .is-collapsed .hero {
      padding-left: 0;
      padding-right: 0;
    }

    .is-collapsed .hero-body {
      padding-left: 0.3175rem;
      padding-right: 0.3175rem;
      box-shadow: none;
    }

    .is-collapsed .input.is-rounded {
      padding-left: 0;
      padding-right: 0;
      opacity: 0;
    }

    .is-collapsed .icon-input-search {
      color: #b5b5b5;
      background-color: #eee;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: auto;
    }

    .is-collapsed .icon-input-search:hover {
      color: #999;
      background-color: #e0e0e0;
    }

    .is-collapsed .menu-wrapper {
      left: -30%;
      opacity: 0;
    }
  }
</style>

<aside class="menu" class:is-collapsed={isCollapsed}>
  <section class="hero is-sticky" class:is-darkmode={isDarkmode}>
    <div class="hero-body" class:is-darkmode={isDarkmode}>
      <div class="field">
        <p class="control has-icons-right">
          <input
            id="search-input-text"
            class="input is-rounded"
            bind:value={query}
            placeholder="Filter by path, method, and title..." />
          <span class="icon is-right icon-input-search" on:click={searchClick}>
            <i class="fas fa-search" />
          </span>
        </p>
      </div>
    </div>
  </section>

  <div class="menu-wrapper">
    <p class="menu-label">API</p>
    <ul class="menu-list">
      <li>
        <a href={basePath(config)} on:click|preventDefault={tocClick}>
          Introduction
        </a>
      </li>
      {#if tagHeaders}
        <li>
          <ul>
            {#each tagHeaders as header}
              {#if header.level === 0}
                <li>
                  <a href="#{headerLink(header.text)}" on:click={tocClick}>
                    {header.text}
                  </a>
                </li>
              {/if}
            {/each}
          </ul>
        </li>
      {/if}
    </ul>

    {#each filteredActions as tag}
      {#if tag.title}
        <p class="menu-label">{tag.title}</p>
      {/if}

      <ul class="menu-list">
        {#each tag.children as child}
          <MenuItem
            title={child.title}
            actions={child.actions}
            hidden={actionsCount > 50}
            {currentSlug}
            {handleClick} />
        {/each}
      </ul>
    {/each}
  </div>
</aside>
