<script>
  import Prism from 'prismjs';

  export let type;
  export let body;

  export const alias = (str) => {
    return str && str.match("json") ? "json" : "none";
  }

  export const stringify = (obj) => {
    if (obj) {
      return JSON.stringify(obj, null, '  ');
    }

    return "";
  }

  export const highlight = (code) => {
    return Prism.highlight(code, Prism.languages.json, 'json');
  }
</script>

<style>
  :global(pre[class*="language-"]) {
    white-space: inherit;
  }

  :global(code[class*="language-"], pre[class*="language-"]) {
    font-family: monospace;
  }

  /* fix prism.js and bulma conflict */
  :global(.token.number) {
    display: inline;
    padding: inherit;
    font-size: inherit;
    line-height: inherit;
    text-align: inherit;
    vertical-align: inherit;
    border-radius: inherit;
    font-weight: inherit;
    white-space: inherit;
    background: inherit;
    margin: inherit;
  }
</style>

{#if body}
<pre class="language-{alias(type)}">
  <code class="language-{alias(type)}">{@html highlight(stringify(body))}</code>
</pre>
{/if}
