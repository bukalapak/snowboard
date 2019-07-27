<script>
  import ParameterTable from "../tables/ParameterTable.svelte";

  export let parameters = [];

  $: pathParameters = parameters.filter(param => param.location === "path");
  $: queryParameters = parameters.filter(param => param.location === "query");
</script>

{#if pathParameters.length > 0}
  <ParameterTable parameters={pathParameters} title="Path Parameters" />
{/if}

{#if queryParameters.length > 0}
  <ParameterTable parameters={queryParameters} title="Query Parameters" />
{/if}
