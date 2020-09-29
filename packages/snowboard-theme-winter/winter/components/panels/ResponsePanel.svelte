<script>
  import { markdown } from "../../lib/helper";
  import HeaderTable from "../tables/HeaderTable.svelte";
  import CodePanel from "./CodePanel.svelte";

  export let response;
  export let show;
</script>

<style>
  .is-borderless {
    box-shadow: none;
  }

  .is-bordered {
    border-top: solid 1px rgba(10, 10, 10, 0.1);
    border-bottom: solid 1px rgba(10, 10, 10, 0.1);
    background-color: rgba(10, 10, 10, 0.035);
  }
</style>

<div class="card is-borderless">
  <header class="card-header is-borderless">
    <p class="card-header-title">
      {#if response.title}
        Response {response.title}
      {:else}Response {response.statusCode}{/if}
    </p>

    <!-- svelte-ignore a11y-invalid-attribute -->
    <a
      href="javascript:void(0)"
      class="card-header-icon"
      on:click={() => (show = !show)}>
      <span class="icon">
        <i
          class="fas"
          class:fa-angle-down={show}
          class:fa-angle-up={!show}
          aria-hidden="true" />
      </span>
    </a>
  </header>
  <div class="card-content is-bordered" class:is-hidden={!show}>
    {#if response.description}
      <div class="content">
        {@html markdown(response.description)}
      </div>
    {/if}

    <HeaderTable headers={response.headers} />

    <CodePanel
      contentType={response.contentType}
      body={response.body}
      schema={response.schema} />
  </div>
</div>
