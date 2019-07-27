<script>
  import CodeBlock from "../components/CodeBlock.svelte";

  export let contentType;
  export let example;
  export let schema;
  export let asToggle;

  let activeBody = "is-active";
  let activeSchema = "";
  let tabIndex = 0;

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
    <div class="tabs is-fullwidth" class:is-toggle={asToggle}>
      <ul>
        <li class:is-active={tabIndex === 0}>
          <a data-index="0" href="javascript:void(0)" on:click={tabSelect}>
            Body
          </a>
        </li>
        <li class:is-active={tabIndex === 1}>
          <a data-index="1" href="javascript:void(0)" on:click={tabSelect}>
            Schema
          </a>
        </li>
      </ul>
    </div>
    <div>
      <section class="tab-content {activeBody}">
        <CodeBlock type={contentType} body={example} />
      </section>
      <section class="tab-content {activeSchema}">
        <CodeBlock type="application/json" body={schema} />
      </section>
    </div>
  </div>
{/if}
