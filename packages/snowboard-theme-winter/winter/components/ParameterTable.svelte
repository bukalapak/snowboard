<script>
  import { markdown } from "../lib/helper";

  export let parameters = [];
</script>

<table class="table table-bordered is-bordered is-fullwidth">
  <thead>
    <tr>
      <th colspan="3">Parameters</th>
    </tr>
  </thead>
  <tbody>
    {#each parameters as { name, example, required, description, schema }}
      <tr>
        <td>
          <code>{name}</code>
        </td>
        <td>
          <div class="tags has-addons">
            <span class="tag">{schema.type}</span>
            {#if required}
              <span class="tag" class:is-dark={required}>required</span>
            {/if}
          </div>
        </td>
        <td>
          {#if description}
            <div class="content">
              {@html markdown(description)}
            </div>
          {:else}
            <div class="content">-</div>
          {/if}

          {#if example}
            <div>
              <span>Example:</span>
              <code class="tag">{example}</code>
            </div>
          {/if}

          {#if schema.enum}
            <div>
              <span>Values:</span>
              <code>{schema.enum}</code>
            </div>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
