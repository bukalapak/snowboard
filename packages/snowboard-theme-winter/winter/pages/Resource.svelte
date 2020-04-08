<script>
  import { Link } from "yrv";
  import { markdown, toHref } from "../lib/helper";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  export let group;
  export let resource;
  export let config;
</script>

<Breadcrumb {group} {resource} {config} />

<h1 class="title">{resource.title}</h1>

<hr />

<div class="content">
  {@html markdown(resource.description)}
</div>

<hr />

<div class="columns is-multiline">
  {#each resource.transitions as transition}
  <div class="column is-3">
      <div class="box">
        <div class="box-content">
          <Link href={toHref(transition.permalink, config.basePath)}>{transition.title}</Link>
        </div>
      </div>
  </div>
  {/each}
</div>
