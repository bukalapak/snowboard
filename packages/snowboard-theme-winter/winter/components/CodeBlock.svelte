<script>
  import { highlight, stringify } from "../lib/helper";

  export let type;
  export let body;

  const alias = str => {
    return str && str.match("json") ? "json" : "markup";
  };

  $: mime = alias(type);
</script>

{#if body}
  <pre class="language-{mime}">
    <code class="language-{mime}">
      {@html highlight(stringify(body), mime)}
    </code>
  </pre>
{/if}
