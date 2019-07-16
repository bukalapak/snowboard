<script>
  import Prism from "prismjs";

  export let type;
  export let body;
  export let highlight;

  export const alias = str => {
    return str && str.match("json") ? "json" : "none";
  };

  export const stringify = obj => {
    if (obj) {
      return JSON.stringify(obj, null, "  ");
    }

    return "";
  };
</script>

{#if body}
  <pre class="language-{alias(type)}">
    <code class="language-{alias(type)}">
      {@html highlight(stringify(body), 'json')}
    </code>
  </pre>
{/if}
