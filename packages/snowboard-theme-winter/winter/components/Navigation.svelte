<script>
  import { Link, router } from "yrv";
  import { filterNavigation } from "snowboard-theme-helper";
  import { toHref, toPermalink } from "../lib/helper";

  export let navigation;

  let filteredNavigation = navigation;
  let permalink = "/";

  router.subscribe(val => {
    permalink = toPermalink(val.path);
    filteredNavigation = filterNavigation(permalink, navigation);
  });
</script>

{#each filteredNavigation as item}
  <ul class="menu-label">
    <li>
      <Link href={toHref(item.permalink)}>{item.title}</Link>
    </li>
  </ul>
  {#each item.children as child}
    <ul class="menu-list">
      <li>
        <Link href={toHref(child.permalink)}>{child.title}</Link>
        <ul>
          {#each child.children as grandchild}
            <li class:is-active={grandchild.permalink == permalink}>
              <Link href={toHref(grandchild.permalink)}>
                {grandchild.title}
              </Link>
            </li>
          {/each}
        </ul>
      </li>
    </ul>
  {/each}
{/each}
