<script>
  import { router, navigateTo } from "yrv";
  import { filterNavigation } from "snowboard-theme-helper";
  import { toHref, toPermalink } from "../lib/helper";

  export let navigation;
  export let config;

  let filteredNavigation = navigation;
  let permalink = "/";

  router.subscribe(val => {
    permalink = toPermalink(val.path, config.basePath);
    filteredNavigation = filterNavigation(permalink, navigation);
  });

  function handleClick(event) {
    let href = event.target.getAttribute("href");

    if (href.startsWith(`${config.basePath}#`)) {
      navigateTo(config.basePath);
      window.scrollTo(
        0,
        document.getElementById(href.substr(2)).offsetTop - 80
      );
    } else {
      navigateTo(href);
    }
  }
</script>

{#each filteredNavigation as item}
  <ul class="menu-label">
    <li>
      <a
        href={toHref(item.permalink, config.basePath)}
        on:click|preventDefault={handleClick}>
        {item.title}
      </a>
    </li>
  </ul>
  {#each item.children as child}
    <ul class="menu-list">
      <li>
        <a
          href={toHref(child.permalink, config.basePath)}
          on:click|preventDefault={handleClick}>
          {child.title}
        </a>
        <ul>
          {#each child.children as grandchild}
            <li class:is-active={grandchild.permalink == permalink}>
              <a
                href={toHref(grandchild.permalink, config.basePath)}
                on:click|preventDefault={handleClick}>
                {grandchild.title}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    </ul>
  {/each}
{/each}
