<script>
  export let headers = [];
</script>

{#if headers.length > 0}
  <table class="table is-stripped is-fullwidth">
    <thead>
      <tr>
        <th colspan="2">Headers</th>
      </tr>
    </thead>
    <tbody>
      {#each headers as { name, example }}
        <tr>
          <td>{name}</td>
          <td>
            <code>{example}</code>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
