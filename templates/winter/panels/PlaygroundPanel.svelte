<script>
  import { beforeUpdate } from "svelte";

  import CollapsiblePanel from "./CollapsiblePanel.svelte";
  import FieldDisabled from "../components/FieldDisabled.svelte";
  import FieldSwitch from "../components/FieldSwitch.svelte";
  import CodeBlock from "../components/CodeBlock.svelte";
  import LoginButton from "../components/LoginButton.svelte";

  import {
    urlParse,
    urlJoin,
    expandUrl,
    colorize,
    getToken,
    isAuth,
    isPKCE,
    allowBody,
    sendRequest,
    copyUrl
  } from "../util.js";

  import { env, auth, token } from "../store.js";

  export let show = true;
  export let isDarkmode;
  export let environments;
  export let currentAction;

  export let requestHeaders;
  export let requestParameters;
  export let requestBody;

  export let pkceChallenge;

  let response;
  let requestTab = 0;
  let copying = false;

  $: environment = environments[$env];
  $: currentUrl = urlParse(urlJoin(environment.url, currentAction.path));

  function handleClick() {
    response = sendRequest($env, environment, currentAction, {
      headers: requestHeaders,
      parameters: requestParameters,
      body: requestBody
    });
  }

  function contentType(headers) {
    return headers && headers["content-type"];
  }

  function basicAuth(username, password) {
    return btoa(`${username}:${password}`);
  }

  function handleTab(index) {
    requestTab = index;
  }

  function handleCopy() {
    copying = true;

    setTimeout(() => {
      copying = false;
    }, 2000);

    copyUrl(currentUrl, requestParameters);
  }

  beforeUpdate(() => {
    const hash = location.hash.replace("#/", "");
    if (hash !== currentAction.slug) response = undefined;
  });
</script>

<style>
  .small-section {
    padding-top: 0.5rem;
  }

  .button-left {
    justify-content: left;
  }

  .control-switch {
    padding-top: 0.4rem;
  }

  .container-content {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    background-color: #2b2b2b;
  }

  .content-header {
    color: #fff;
    border-bottom: dashed 1px #777;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  }

  .hero-small {
    padding: 1.5rem;
  }

  .has-border {
    border-color: #dbdbdb;
  }

  .hero-rounded {
    border-radius: 4px;
  }
</style>

<CollapsiblePanel dark={true} {isDarkmode} {show}>
  <span slot="heading">Playground</span>
  <div slot="body">
    <div class="columns">
      <div class="column">
        {#if copying}
          <button
            class="button button-left is-warning is-family-code is-fullwidth">
            <span>URL has been copied to clipboard.</span>
          </button>
        {:else}
          <a
            href="javascript:void(0)"
            on:click={handleCopy}
            class="button button-left is-warning is-family-code is-fullwidth">
            <span class="is-uppercase has-text-weight-bold">
              {currentAction.method}
            </span>
            &nbsp;
            <span>{currentUrl.origin}</span>
            <span class="has-text-weight-bold">{currentUrl.pathname}</span>
          </a>
        {/if}
      </div>
      <div class="column is-one-fifth">
        {#if isAuth(environment, 'oauth2') && !$auth.split(';').includes($env)}
          <LoginButton
            authOptions={environment.auth.options}
            isPKCE={isPKCE(environment)}
            {pkceChallenge}
            fullWidth={true} />
        {:else}
          <button class="button is-success is-fullwidth" on:click={handleClick}>
            <span class="icon">
              <i class="fas fa-paper-plane" />
            </span>
            <span>Send</span>
          </button>
        {/if}
      </div>
    </div>

    <div class="tabs is-boxed">
      <ul>
        <li class:is-active={requestTab === 0}>
          <a href="javascript:void(0)" on:click={() => handleTab(0)}>Headers</a>
        </li>
        <li class:is-active={requestTab === 1}>
          <a href="javascript:void(0)" on:click={() => handleTab(1)}>
            Parameters
          </a>
        </li>
        <li class:is-active={requestTab === 2}>
          <a href="javascript:void(0)" on:click={() => handleTab(2)}>Body</a>
        </li>
      </ul>
    </div>

    <div class="section-headers" class:is-hidden={requestTab != 0}>
      {#if requestHeaders.length === 0 && !environment.auth}
        <p>
          <em>No configurable headers.</em>
        </p>
      {:else}
        {#each requestHeaders as header}
          <FieldSwitch
            name={header.name}
            required={header.required}
            bind:used={header.used}
            bind:value={header.value}
            rounded={true} />
        {/each}
      {/if}

      {#if isAuth(environment, 'basic')}
        <FieldDisabled
          name="authorization"
          placeholder="Authorization"
          value="Basic {basicAuth(environment.auth.options.username, environment.auth.options.password)}" />
      {/if}

      {#if isAuth(environment, 'apikey')}
        <FieldDisabled
          name="authorization"
          placeholder={environment.auth.options.header}
          value={environment.auth.options.key} />
      {/if}

      {#if isAuth(environment, 'oauth2')}
        {#if $auth.split(';').includes($env)}
          <FieldDisabled
            name="authorization"
            placeholder="Authorization"
            value="Bearer {$token}" />
        {/if}
      {/if}
    </div>

    <div class="section-parameters" class:is-hidden={requestTab != 1}>
      {#if requestParameters.length === 0}
        <p>
          <em>No configurable parameters.</em>
        </p>
      {:else}
        {#each requestParameters as param}
          <FieldSwitch
            name={param.name}
            required={param.required}
            bind:used={param.used}
            bind:value={param.value}
            rounded={false} />
        {/each}
      {/if}
    </div>

    <div class="section-body" class:is-hidden={requestTab != 2}>
      {#if allowBody(currentAction)}
        <textarea
          class="textarea is-family-code"
          bind:value={requestBody}
          rows="8" />
      {:else}
        <p>
          <i>Body is only available for POST, PUT and PATCH.</i>
        </p>
      {/if}
    </div>

    {#await response}
      <div class="section has-text-centered">
        <span class="icon is-medium has-text-danger">
          <i class="fas fa-2x fa-spinner fa-pulse" />
        </span>
      </div>
    {:then value}
      {#if Object.keys(value || {}).length > 0}
        <div class="small-section">
          <section class="hero hero-rounded {colorize(value.status)}">
            <section class="hero-body hero-small">
              <div class="container has-text-centered">
                <h1 class="title">{value.status} {value.statusText}</h1>
              </div>
            </section>
          </section>

          {#if Object.keys(value.headers).length > 0}
            <div class="container container-content">
              <div class="content-header">
                {#each Object.entries(value.headers) as [key, val]}
                  <p class="is-family-code">
                    <span class="is-capitalized">{key}</span>
                    : {val}
                  </p>
                {/each}
              </div>

              <CodeBlock type={contentType(value.headers)} body={value.data} />
            </div>
          {/if}
        </div>
      {/if}
    {:catch error}
      <div class="small-section">
        <section class="hero is-danger">
          <section class="hero-body">
            <div class="container">
              <p class="subtitle">{error}</p>
            </div>
          </section>
        </section>
      </div>
    {/await}
  </div>
</CollapsiblePanel>
