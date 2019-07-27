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
  .hero {
    position: sticky;
    top: 54px;
    background-color: #fafafa;
    box-shadow: 0 2px 0 0 #f5f5f5;
    margin-bottom: 1.5rem;
  }

  .hero-body {
    padding: 1.5rem;
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
</aside>
