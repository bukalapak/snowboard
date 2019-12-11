<script>
  import HeaderTable from "../tables/HeaderTable.svelte";
  import CodePanel from "./CodePanel.svelte";

  import { colorize, markdown } from "../util.js";

  export let title;
  export let description;
  export let headers;
  export let statusCode;
  export let contentType;
  export let example;
  export let schema;
</script>

<div class="card">
  <header class="card-header">
    <p class="card-header-title">
      {#if title}Response {title}{:else}{contentType || 'Response'}{/if}
    </p>

    <a href="javascript:void(0)" class="card-header-icon is-family-code">
      {#if title !== ''}
        <span class="tag is-medium is-white">{contentType || ''}</span>
      {/if}
      <code class="tag is-medium {colorize(statusCode)}">{statusCode}</code>
    </a>
  </header>
  <div class="card-content">
    {#if description}
      <div class="content">
        {@html markdown(description)}
      </div>
    {/if}

    <HeaderTable {headers} />

    <CodePanel {contentType} {example} {schema} asToggle={false} />
  </div>
</div>
