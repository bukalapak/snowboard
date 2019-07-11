<script>
  import Code from "./Code.svelte";

  export let contentType;
  export let example;
  export let schema;

  export let activeBody = "is-active";
  export let activeSchema = "";
  export let tabIndex = 0;

  $: activeBody = tabIndex === 0 ? "is-active" : "";
  $: activeSchema = tabIndex === 1 ? "is-active" : "";

  export const tabSelect = event => {
    const index = event.target.dataset["index"];
    tabIndex = parseInt(index, 10);
  };
</script>

<style>
  .tab-content {
    display: none;
  }

  .tab-content.is-active {
    display: block;
  }
</style>

{#if example || schema}
  <div class="tabs-with-content">
    <div class="tabs is-fullwidth">
      <ul>
        <li class={activeBody}>
          <a data-index="0" href="javascript:void(0)" on:click={tabSelect}>
            Body
          </a>
        </li>
        <li class={activeSchema}>
          <a data-index="1" href="javascript:void(0)" on:click={tabSelect}>
            Schema
          </a>
        </li>
      </ul>
    </div>
    <div>
      <section class="tab-content {activeBody}">
        <Code type={contentType} body={example} />
      </section>
      <section class="tab-content {activeSchema}">
        <Code type="application/json" body={schema} />
      </section>
    </div>
  </div>
{/if}
