<script>
  import { colorize, slugify } from "../util.js";

  export let title;
  export let actions;
  export let currentSlug;
  export let parentSLug;
  export let hidden = false;

  export let handleClick;
  export let handleGroupClick;
</script>

<style>
  .tag {
    width: 3.5rem;
  }

  .menu-ellipsis {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding: 0.25em 0.75em;
  }

  .menu-action {
    vertical-align: middle;
  }
</style>

{#if title}
  <li>
    <a
      data-slug="{parentSLug}~{slugify(title)}"
      href="#/g~{parentSLug}~{slugify(title)}"
      class="is-inline-block"
      on:click={handleGroupClick}>
      {title}
    </a>
    <a
      href="javascript:void(0)"
      class="is-inline-block is-pulled-right"
      on:click={() => (hidden = !hidden)}>
      <span class="icon is-small has-text-grey-light">
        <i
          class="fas"
          class:fa-chevron-right={hidden}
          class:fa-chevron-down={!hidden} />
      </span>
    </a>
  </li>
{/if}

{#if actions.length > 0}
  <li class:is-hidden={hidden}>
    <ul>
      {#each actions as action}
        <li>
          <a
            data-slug={action.slug}
            href="#/{action.slug}"
            class="menu-ellipsis"
            on:click={handleClick}
            class:is-active={action.slug === currentSlug}>
            <code class="tag {colorize(action.method)} is-uppercase">
              {action.method}
            </code>
            <span class="menu-action">{action.title}</span>
          </a>
        </li>
      {/each}
    </ul>
  </li>
{/if}
