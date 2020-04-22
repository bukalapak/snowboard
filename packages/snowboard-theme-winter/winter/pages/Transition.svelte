<script>
  import { toTransactions } from "snowboard-theme-helper";
  import { markdown, colorize } from "../lib/helper";

  import ParameterTable from "../components/tables/ParameterTable.svelte";
  import HeaderTable from "../components/tables/HeaderTable.svelte";
  import CodePanel from "../components/panels/CodePanel.svelte";
  import ResponsePanel from "../components/panels/ResponsePanel.svelte";
  import PlaygroundPanel from "../components/panels/PlaygroundPanel.svelte";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  export let transition;
  export let config;

  let transactions = toTransactions(transition.transactions);
</script>

<style>
  .has-space {
    margin-bottom: 2rem;
  }

  .card-header-title {
    display: block;
    text-align: center;
  }

  .tag-fullwidth {
    flex-grow: 1;
    justify-content: start;
  }
</style>

<Breadcrumb
  group={transition.meta.group}
  resource={transition.meta.resource}
  {transition}
  {config} />

<h1 class="title is-4">{transition.title}</h1>

<hr />

<div class="content">
  {@html markdown(transition.description)}
</div>

<div class="tags has-addons are-large">
  <code class="tag is-uppercase {colorize(transition.method)}">
    {transition.method}
  </code>
  <code class="tag tag-fullwidth" data-tooltip={transition.pathTemplate}>
    {transition.path}
  </code>
</div>

{#if config.playground.enabled}
  <PlaygroundPanel {transition} {config} />
{/if}

{#if transition.parameters.length > 0}
  <ParameterTable parameters={transition.parameters} />
{/if}

{#each transactions as { request, responses }, index}
  <div class="card has-space">
    <header class="card-header">
      <div class="card-header-title">
        <span>
          {request.title == '' ? `Request #${index + 1}` : request.title}
        </span>
      </div>
    </header>
    <div class="card-content">
      {#if request.description}
        <div class="content">
          {@html markdown(request.description)}
        </div>
      {/if}

      {#if request.headers}
        <HeaderTable headers={request.headers} />
      {/if}

      <CodePanel
        contentType={request.contentType}
        body={request.body}
        schema={request.schema}
        asToggle={true} />

      {#each responses as response, index}
        <ResponsePanel {response} show={index === 0} />
      {/each}
    </div>
  </div>
{/each}
