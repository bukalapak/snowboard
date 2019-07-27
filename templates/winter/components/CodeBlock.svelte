<script>
  import { highlight, stringify, alias } from "../util.js";

  export let type;
  export let body;

  $: mime = alias(type);
</script>

{#if body}
  <pre class="language-{mime}">
    <code class="language-{mime}">
      {@html highlight(stringify(body), mime)}
    </code>
  </pre>
{/if}
