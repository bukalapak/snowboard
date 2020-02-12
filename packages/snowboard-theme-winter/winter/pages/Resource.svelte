<script>
  import { markdown } from "../lib/helper";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  export let group;
  export let resource;
</script>

<Breadcrumb {group} {resource} />

<h1 class="title">{resource.title}</h1>

<hr />

<div class="content">
  {@html markdown(resource.description)}
</div>
