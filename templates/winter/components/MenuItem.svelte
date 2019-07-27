<script>
  import { colorize } from "../util.js";

  export let title;
  export let actions;
  export let currentSlug;
  export let hidden = false;

  export let handleClick;
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
    <a href="javascript:void(0)" on:click={() => (hidden = !hidden)}>
      <span class="icon has-text-grey-light">
        <i
          class="fas"
          class:fa-chevron-right={hidden}
          class:fa-chevron-down={!hidden} />
      </span>
      {title}
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
