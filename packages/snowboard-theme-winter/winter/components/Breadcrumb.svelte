<script>
  import { Link } from "yrv";
  import { toHref } from "../lib/helper";

  export let group;
  export let config;
  export let resource = undefined;
  export let transition = undefined;
</script>

{#if resource || transition}
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      {#if group}
        <li>
          <Link href={toHref(group.permalink, config.basePath)}>{group.title}</Link>
        </li>
      {/if}

      {#if resource}
        <li>
          <Link href={toHref(resource.permalink, config.basePath)}>{resource.title}</Link>
        </li>
      {/if}

      {#if transition}
        <li>
          <Link href={toHref(transition.permalink, config.basePath)}>{transition.title}</Link>
        </li>
      {/if}
    </ul>
  </nav>
{/if}
