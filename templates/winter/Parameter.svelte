<script>
  import marked from 'marked';

  export let parameters = [];
</script>

{#if parameters.length > 0}
<table class="table table-bordered is-bordered is-fullwidth">
  <thead>
    <tr>
      <th colspan="4">Parameters</th>
    </tr>
  </thead>
  <tbody>
  {#each parameters as { name, example, required, description, schema }}
    <tr>
      <td>
        {#if required}
          <span class="tag is-black">Required</span>
        {:else}
          <span class="tag">Optional</span>
        {/if}
      </td>
      <td><code>{name}</code></td>
      <td>
        <code>{schema.type}</code>
      </td>
      <td>
        <div class="content">
          {#if description}
            {@html marked(description)}
          {:else}
            <p>-</p>
          {/if}

          {#if example}
            <p><span>Example:</span> <code class="tag">{example}</code></p>
          {/if}

          {#if schema.enum}
            <p><span>Values:</span> <code>{schema.enum}</code></p>
          {/if}
        </div>
      </td>
    </tr>
  {/each}
  </tbody>
</table>
{/if}
