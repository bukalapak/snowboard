<script>
  import { router } from "yrv";
  import { colorize, slugify, handleLink } from "../util";

  export let title;
  export let actions;
  export let parentSlug;
  export let hidden = false;
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
      data-slug="{parentSlug}~{slugify(title)}"
      href="/#/g~{parentSlug}~{slugify(title)}"
      class="is-inline-block"
      on:click={handleLink}>
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
            href="/#/{action.slug}"
            class="menu-ellipsis"
            class:is-active={action.slug === $router.params.slug}
            on:click={handleLink}>
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
