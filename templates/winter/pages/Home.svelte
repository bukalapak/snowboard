<script>
  import { markdown } from "../util.js";

  export let title;
  export let description;
</script>

<h1 class="title">{title}</h1>
<div class="content">
  {@html markdown(description)}
</div>
