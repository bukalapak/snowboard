<script>
  import Header from "./Header.svelte";
  import CodePanel from "./CodePanel.svelte";

  export let title;
  export let description;
  export let headers;
  export let statusCode;
  export let contentType;
  export let example;
  export let schema;

  export let colorize;
  export let markdown;
  export let highlight;
</script>

<div class="card">
  <header class="card-header">
    {#if title}
      <p class="card-header-title">Response {title}</p>
    {:else}
      <p class="card-header-title">Response</p>
    {/if}

    <a href="javascript:void(0)" class="card-header-icon is-family-code">
      <span class="tag is-medium is-white">{contentType || ''}</span>
      <code class="tag is-medium {colorize(statusCode)}">{statusCode}</code>
    </a>
  </header>
  <div class="card-content">
    {#if description}
      <div class="content">
        {@html markdown(description)}
      </div>
    {/if}

    <Header {headers} />

    <CodePanel {contentType} {example} {schema} {highlight} />
  </div>
</div>
