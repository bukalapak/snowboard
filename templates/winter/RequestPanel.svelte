<script>
  import Header from "./Header.svelte";
  import CodePanel from "./CodePanel.svelte";

  export let title;
  export let description;
  export let headers;
  export let contentType;
  export let example;
  export let schema;
  export let markdown;

  $: showRequest = !!(
    title != "" ||
    description ||
    headers.length !== 0 ||
    example
  );
</script>

{#if showRequest}
  <div class="card">
    <header class="card-header">
      {#if title}
        <p class="card-header-title">Request {title}</p>
      {:else}
        <p class="card-header-title">Request</p>
      {/if}
    </header>
    <div class="card-content">
      {#if description}
        <div class="content">
          {@html markdown(description)}
        </div>
      {/if}

      <Header {headers} />

      <CodePanel {contentType} {example} {schema} />
    </div>
  </div>
  <hr />
{/if}
