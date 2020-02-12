<script>
  import { markdown } from "../lib/helper";

  export let title;
  export let description;
</script>

<h1 class="title">{title}</h1>
<div class="content">
  {@html markdown(description)}
</div>
