<script>
  import { markdown } from "../lib/helper";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  export let group;
</script>

<Breadcrumb {group} />

<h1 class="title">{group.title}</h1>

<hr />

<div class="content">
  {@html markdown(group.description)}
</div>
