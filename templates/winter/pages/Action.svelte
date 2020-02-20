<script>
  import XXH from "xxhashjs";
  import stableStringify from "fast-json-stable-stringify";
  import {
    slugify,
    colorize,
    markdown,
    handleLink,
    isAuth,
    stringify
  } from "../util";

  import ParameterPanel from "../panels/ParameterPanel.svelte";
  import PlaygroundPanel from "../panels/PlaygroundPanel.svelte";
  import ScenarioPanel from "../panels/ScenarioPanel.svelte";

  export let action;
  export let config;
  export let environment;
  export let challengePair;
  export let darkMode;

  import { env, auth, token } from "../store";

  $: transactions = toTransactions(action && action.transactions);

  function sample(action) {
    return action.transactions[0].request;
  }

  function headersMap(action) {
    return sample(action)
      .headers.filter(header => header.name != "Authorization")
      .map(header => {
        return {
          used: true,
          required: false,
          name: header.name,
          value: header.example || ""
        };
      });
  }

  function authHeader(action, environment) {
    const header = sample(action).headers.find(
      header => header.name === "Authorization"
    );

    if (!header) return;

    header.value = header.example;
    header.used = true;

    if (isAuth(environment, "basic")) {
      header.value = `Basic ${basicAuth(
        environment.auth.options.username,
        environment.auth.options.password
      )}`;
    }

    if (isAuth(environment, "apikey")) {
      header.name = environment.auth.options.header;
      header.value = environment.auth.options.key;
    }

    if (isAuth(environment, "oauth2")) {
      if ($auth.split(";").includes($env)) {
        header.value = `Bearer ${$token}`;
      }
    }

    return header;
  }

  function parametersMap(action) {
    return action.parameters.map(param => {
      return {
        used: param.required,
        required: param.required,
        name: param.name,
        value: param.example || ""
      };
    });
  }

  function bodyMap(action) {
    const example = sample(action).example;
    return stringify(example);
  }

  function toTransactions(transactions) {
    if (!transactions) return [];

    const items = {};

    transactions.forEach(transaction => {
      const { request, response } = transaction;
      const requestHash = XXH.h32(stableStringify(request), 0xabcde).toString(
        16
      );

      if (!Object.keys(items).includes(requestHash)) {
        items[requestHash] = {
          request,
          responses: [response]
        };
      } else {
        items[requestHash].responses.push(response);
      }
    });

    return Object.values(items);
  }
</script>

<style>
  .breadcrumb-right {
    margin-top: 0.3em;
  }

  .box-wrapper {
    border-radius: 0;
  }
</style>

{#if action}
  <div class="columns">
    <div class="column">
      <h1 class="title is-4">{action.title}</h1>
    </div>
    <div class="column">
      <nav
        class="breadcrumb breadcrumb-right is-pulled-right"
        aria-label="breadcrumbs">
        <ul>
          {#each action.tags as tag, index}
            <li>
              {#if index === 0}
                <a href="javascript:void(0)">{tag}</a>
              {:else}
                <a
                  href="/#/g~{slugify(action.tags[0])}~{slugify(tag)}"
                  on:click={handleLink}>
                  {tag}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  </div>

  <hr />

  <div class="tags has-addons are-large">
    <code class="tag is-uppercase {colorize(action.method)}">
      {action.method}
    </code>
    <code class="tag ">{action.pathTemplate}</code>
  </div>

  <div class="content">
    {@html markdown(action.description)}
  </div>

  {#if config.playground.enabled}
    {#if environment.playground !== false}
      <PlaygroundPanel
        currentAction={action}
        pkceChallenge={challengePair}
        environments={config.playground.environments}
        requestHeaders={headersMap(action)}
        requestAuthHeader={authHeader(action, environment)}
        requestParameters={parametersMap(action)}
        requestBody={bodyMap(action)}
        isDarkmode={darkMode.active} />
    {/if}
  {/if}

  <ParameterPanel parameters={action.parameters} />

  {#each transactions as { request, responses }, index}
    <ScenarioPanel
      show={index === 0}
      isDarkmode={darkMode.active}
      {request}
      {responses}
      {index}
      count={transactions.length} />
  {/each}
{:else}
  <h3>404 - Not Found</h3>
{/if}
