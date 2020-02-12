<script>
  import { Link } from "yrv";
  import { toHref } from "../lib/helper";

  export let group;
  export let resource;
  export let transition;
</script>

{#if resource || transition}
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      {#if group}
        <li>
          <Link href={toHref(group.permalink)}>{group.title}</Link>
        </li>
      {/if}

      {#if resource}
        <li>
          <Link href={toHref(resource.permalink)}>{resource.title}</Link>
        </li>
      {/if}

      {#if transition}
        <li>
          <Link href={toHref(transition.permalink)}>{transition.title}</Link>
        </li>
      {/if}
    </ul>
  </nav>
{/if}
