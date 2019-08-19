<script>
  import MenuItem from "../components/MenuItem.svelte";

  import { colorize, slugify, filterActions, basePath } from "../util.js";

  export let config = {};
  export let tagActions = [];
  export let tagHeaders = [];
  export let currentSlug;
  export let actionsCount;

  export let handleClick;
  export let tocClick;

  let query = "";

  $: regex = new RegExp(query, "gi");
  $: filteredActions = filterActions(tagActions, regex);

  function headerLink(text) {
    return text.toLowerCase().replace(/\s/g, "-");
  }
</script>

<style>
  .hero, .menu-wrapper {
    padding: 0 2.75rem 0 2rem;
  }

  .hero {
    position: sticky;
    top: 54px;
    background-color: #fafafa;
    margin-bottom: 1.5rem;
  }

  .hero-body {
    padding: 1.5rem 0;
    box-shadow: 0 2px 0 0 #f5f5f5;
  }

  .menu-wrapper::-webkit-scrollbar {
    display: none;
  }

  @media screen and (min-width: 768px) {
    .hero, .menu-wrapper {
      width: -moz-calc(25% - .5rem);
      width: -webkit-calc(25% - .5rem);
      width: -o-calc(25% - .5rem);
      width: calc(25% - .5rem);
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
    }
  }
</style>

<aside class="menu">
  <section class="hero is-sticky">
    <div class="hero-body">
      <div class="field">
        <p class="control has-icons-right">
          <input
            class="input is-rounded"
            bind:value={query}
            placeholder="Filter by path, method, and title..." />
          <span class="icon is-right">
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
