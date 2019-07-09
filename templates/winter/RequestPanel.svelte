<script>
  import Header from './Header.svelte';
  import CodePanel from './CodePanel.svelte';

  export let title;
  export let description;
  export let headers;
  export let contentType;
  export let example;
  export let schema;
</script>

{#if title || description}
<div class="content">
  {#if title}
    <p class="title is-5">{title}</p>
  {:else}
    {#if description}
      <p class="title is-5">Request</p>
    {/if}
  {/if}

  {#if description}
    <div>{description}</div>
  {/if}
</div>
{/if}

<Header headers={headers} />

<CodePanel
  contentType={contentType}
  example={example}
  schema={schema} />

{#if title || description}
<hr>
{/if}
