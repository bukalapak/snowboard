<script>
  import { Link } from "yrv";
  import { markdown, toHref } from "../lib/helper";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  export let group;
  export let config;
</script>

<style>
  .box {
    border-radius: 0;
    box-shadow: none;
  }

  .subtitle {
    box-shadow: 0px 2px 0px 0px #eee;
    padding-bottom: 8px;
  }
</style>

<Breadcrumb {group} {config} />

<h1 class="title">{group.title}</h1>

<hr />

<div class="content">
  {@html markdown(group.description)}
</div>

<div class="columns is-multiline">
  {#each group.resources as resource}
    <div class="column is-4">
      <div class="box">
        <div class="box-content">
          <p class="subtitle">
            <Link href={toHref(resource.permalink, config.basePath)}>
              {resource.title}
            </Link>
          </p>
          <ul>
            {#each resource.transitions as transition}
              <li>
                <Link href={toHref(transition.permalink, config.basePath)}>
                  {transition.title}
                </Link>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/each}
</div>
