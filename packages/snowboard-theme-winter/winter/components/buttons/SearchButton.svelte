<script>
  import { navigateTo } from "yrv";
  import { filter } from "../../lib/helper";
  import { darkMode } from "../../lib/store";

  export let groups;
  export let toggleSearch;

  let query = "";
  let searchInput;

  $: items = filter(query, groups);

  function handleClick(event) {
    let href = event.target.getAttribute("href");

    if (!href) {
      href = event.target.parentNode.getAttribute("href");
    }

    navigateTo(href);
    toggleSearch();
  }
</script>

<style>
  .navbar-dropdown {
    width: 380px;
  }

  @media screen and (min-width: 1024px) {
    .navbar-dropdown .navbar-item {
      padding-right: 20px;
    }
  }

  :global(.navbar-dropdown .navbar-item) {
    justify-content: space-between;
  }

  .has-dark-background {
    background-color: #484848;
    border-color: #484848;
    color: #fff;
  }

  .has-dark-background::placeholder {
    color: #ccc;
  }
</style>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
  href="javascript:void(0)"
  class="navbar-link is-arrowless"
  on:click={toggleSearch}>
  <span class="icon is-medium has-text-grey-light">
    <i class="fas fa-lg fa-search" />
  </span>
</a>

<div class="navbar-dropdown is-right">
  <div class="navbar-item">
    <input
      class="input is-rounded"
      class:has-dark-background={$darkMode}
      bind:this={searchInput}
      bind:value={query}
      placeholder="Filter by path, method, and title..." />

  </div>
  {#if query !== ''}
    <hr class="navbar-divider" />
    {#each items as item}
      <a
        class="navbar-item"
        href={item.href}
        on:click|preventDefault={handleClick}>
        <span>{item.title}</span>
        <span
          class="tag"
          class:is-primary={item.kind == 'group'}
          class:is-info={item.kind == 'resource'}
          class:is-success={item.kind == 'transition'}>
          {item.kind}
        </span>
      </a>
    {/each}
  {/if}
</div>
