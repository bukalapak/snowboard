<script>
  import getSlug from "speakingurl";

  export let tagActions = [];
  export let tagHeaders = [];
  export let currentSlug;
  export let colorize;
  export let handleClick;

  function slugify(str) {
    return getSlug(str, "-");
  }
</script>

<style>
  @media only screen and (min-width: 768px) {
    aside {
      width: 30%;
      position: fixed !important;
      height: 100% !important;
      overflow-y: auto !important;
    }
  }
</style>

<aside class="menu">
  <p class="menu-label">API</p>
  <ul class="menu-list">
    <li>
      <a href="#introduction" on:click={handleClick}>Introduction</a>
    </li>
    {#if tagHeaders}
      <li>
        <ul>
          {#each tagHeaders as header}
            {#if header.level === 0}
              <li>
                <a href="javascript:void(0)">{header.text}</a>
              </li>
            {/if}
          {/each}
        </ul>
      </li>
    {/if}
  </ul>

  {#each tagActions as tag}
    {#if tag.title}
      <p class="menu-label">{tag.title}</p>
    {/if}

    <ul class="menu-list">
      {#each tag.children as child}
        {#if child.title}
          <li>
            <a href="javascript:void(0)">{child.title}</a>
          </li>
        {/if}
        <li>
          <ul>
            {#each child.actions as action}
              <li>
                {#if action.slug === currentSlug}
                  <a
                    data-slug={action.slug}
                    href="#{action.slug}"
                    on:click={handleClick}
                    class="is-active">
                    {action.title}
                    <code
                      class="tag {colorize(action.method)} is-uppercase
                      is-pulled-right">
                      {action.method}
                    </code>
                  </a>
                {:else}
                  <a
                    data-slug={action.slug}
                    href="#{action.slug}"
                    on:click={handleClick}>
                    {action.title}
                    <code
                      class="tag {colorize(action.method)} is-uppercase
                      is-pulled-right">
                      {action.method}
                    </code>
                  </a>
                {/if}
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/each}
</aside>
