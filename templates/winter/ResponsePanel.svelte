<script>
  import Header from './Header.svelte';
  import CodePanel from './CodePanel.svelte';

  export let title;
  export let description;
  export let headers;
  export let statusCode;
  export let contentType;
  export let example;
  export let schema;

  export let colorize;
</script>

<div class="card">
  <header class="card-header">
    {#if title}
      <p class="card-header-title">{title}</p>
    {:else}
      <p class="card-header-title">Response</p>
    {/if}
  </header>
  <div class="card-content">
    {#if description}
      <div class="content">{description}</div>
    {/if}

    <Header headers={headers} />

    <div class="notification is-white">
      {#if contentType}
        <div class="buttons has-addons are-medium is-family-code is-centered">
          <span class="button is-rounded {colorize(statusCode)}">{statusCode}</span>
          <span class="button is-rounded is-light">{contentType || ''}</span>
        </div>
      {:else}
        <div class="buttons are-medium is-family-code is-centered">
          <span class="button is-rounded {colorize(statusCode)}">{statusCode}</span>
        </div>
      {/if}
    </div>

    <CodePanel
      contentType={contentType}
      example={example}
      schema={schema} />
  </div>
</div>
