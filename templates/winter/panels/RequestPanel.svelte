<script>
  import HeaderTable from "../tables/HeaderTable.svelte";
  import CodePanel from "./CodePanel.svelte";

  import { markdown } from "../util.js";

  export let description;
  export let headers;
  export let contentType;
  export let example;
  export let schema;

  $: showRequest = !!(description || headers.length !== 0 || example);
</script>

{#if description}
  <div class="content">
    {@html markdown(description)}
  </div>
{/if}

<HeaderTable {headers} />

<CodePanel {contentType} {example} {schema} asToggle={true} />

{#if showRequest}
  <hr />
{/if}
