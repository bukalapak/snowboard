<script>
  import { isEmpty } from "lodash";
  import { afterUpdate } from "svelte";
  import qs from "querystringify";
  import AceEditor from 'svelte-ace-editor';

  require('brace');
  require('brace/mode/xml');
  require('brace/mode/json');
  require('brace/mode/html');
  require('brace/mode/plain_text');
  require('brace/mode/javascript');
  require('brace/mode/plain_text');
  require('brace/theme/clouds');
  require('brace/theme/clouds_midnight');

  import {
    clipboardCopy,
    getChallengePair,
    getState,
    getToken,
    expandUrl,
    urlParse,
    urlJoin,
    toCurl
  } from "snowboard-theme-helper";

  import { env, auth, darkMode, token } from "../../lib/store";
  import { isAuth, colorize, sendRequest } from "../../lib/helper";

  import CollapsiblePanel from "./CollapsiblePanel.svelte";
  import LoginButton from "../buttons/LoginButton.svelte";
  import FieldSwitch from "../FieldSwitch.svelte";
  import CodeBlock from "../CodeBlock.svelte";

  export let transition;
  export let config;

  $: environment = config.playground.environments[$env];
  $: currentUrl = urlParse(urlJoin(environment.url, transition.path));
  $: fullUrl = toFullUrl(currentUrl, populate(requestParameters));
  $: isOauth2 = isAuth(environment, "oauth2") || false;
  $: isSendEnabled = isOauth2 ? !isEmpty($token) : true;

  let show = true;
  let copying = false;
  let requestTab = 0;
  let challengePair = getChallengePair();
  let codeState = getState();

  let response;
  let requestBody = prepareBody(
    transition.transactions[0].request.method,
    transition.transactions[0].request.body || ''
  );

  let requestParameters = transition.parameters.map(val => {
    const param = Object.assign({}, val);
    param.used = true;
    return param;
  });

  let requestHeaders = prepareHeaders(
    config.playground.environments[$env],
    transition.transactions[0].request.headers
  );

  let prev = $env;

  let editorSupportedLanguages = [
    { description: 'Text', lang: 'plain_text', contentType: 'text/plain' },
    { description: 'JavaScript', lang: 'javascript', contentType: 'application/javascript' },
    { description: 'JSON', lang: 'json', contentType: 'application/json' },
    { description: 'HTML', lang: 'html', contentType: 'text/html' },
    { description: 'XML', lang: 'xml', contentType: 'application/xml' }
  ]

  let bodyLang = initBodyLang();

  afterUpdate(() => {
    if (prev != $env) {
      prev = $env;
      requestHeaders = prepareHeaders(
        config.playground.environments[$env],
        transition.transactions[0].request.headers
      );
    }
  });

  $: curl = toCurl({
    environment: environment,
    pathTemplate: transition.pathTemplate,
    method: transition.method,
    body: requestBody,
    headers: populate(requestHeaders),
    parameters: populate(requestParameters)
  });

  function initBodyLang() {
    const contentTypeHeader = requestHeaders
      .find(({ name }) => name === 'Content-Type')

    if (!contentTypeHeader) {
      return 'plain_text'
    }

    const supportedLang = editorSupportedLanguages.find(({ contentType }) => {
      return contentTypeHeader.example.includes(contentType)
    })

    return supportedLang ? supportedLang.lang : 'plain_text'
  }

  function onEditorChange (newValue) {
    requestBody = newValue.detail;
  }

  function handleCopy() {
    copying = true;

    setTimeout(() => {
      copying = false;
    }, 2000);

    copyUrl(currentUrl, populate(requestParameters));
  }

  function copyUrl(url, parameters) {
    const expandedUrl = expandUrl(url.pathname, parameters);
    clipboardCopy(url.origin + expandedUrl);
  }

  function toFullUrl(url, parameters) {
    const expandedUrl = expandUrl(url.pathname, parameters);
    return urlParse(url.origin + expandedUrl);
  }

  function handleSend() {
    response = sendRequest({
      environment: environment,
      method: transition.method,
      pathTemplate: transition.pathTemplate,
      headers: populate(requestHeaders),
      parameters: populate(requestParameters),
      body: requestBody
    });
  }

  function handleTab(index) {
    requestTab = index;
  }

  function contentType(headers) {
    return headers && headers["content-type"];
  }

  function isAllowBody(method) {
    return ["PUT", "POST", "PATCH"].includes(method);
  }

  function populate(arr) {
    return arr
      .filter(Boolean)
      .filter(obj => obj.used)
      .reduce((prev, cur) => {
        prev[cur.name] = cur.example;
        return prev;
      }, {});
  }

  function formatCurl(str) {
    return str
      .split(" -H")
      .join(" \\\n -H")
      .split(" --data")
      .join(" \\\n --data");
  }

  function basicAuth(username, password) {
    return btoa(`${username}:${password}`);
  }

  function headerIndex(headers, name) {
    return headers.findIndex(
      header => header.name.toLowerCase() === name.toLowerCase()
    );
  }

  function prepareHeaders(environment, headers) {
    const mapHeaders = headers.map(val => {
      const header = Object.assign({}, val);
      header.used = true;
      return header;
    });

    if (isAuth(environment, "oauth2")) {
      const index = headerIndex(mapHeaders, "authorization");
      const example = $token ? `Bearer ${token}` : "";

      if (mapHeaders[index]) {
        mapHeaders[index].example = example;
      } else {
        mapHeaders.push({
          name: "Authorization",
          example,
          used: true
        });
      }
    }

    if (isAuth(environment, "apikey")) {
      const index = headerIndex(mapHeaders, environment.auth.options.header);

      if (mapHeaders[index]) {
        mapHeaders[index].example = environment.auth.options.key;
      } else {
        mapHeaders.push({
          name: environment.auth.options.header,
          example: environment.auth.options.key,
          used: true
        });
      }
    }

    if (isAuth(environment, "basic")) {
      const index = headerIndex(mapHeaders, "authorization");
      const authDigest = basicAuth(
        environment.auth.options.username,
        environment.auth.options.password
      );

      if (mapHeaders[index]) {
        mapHeaders[index].example = `Basic ${authDigest}`;
      } else {
        mapHeaders.push({
          name: "Authorization",
          example: `Basic ${authDigest}`,
          used: true
        });
      }
    }

    return mapHeaders;
  }

  function prepareBody(method, body) {
    if (isAllowBody(method)) {
      return body;
    }

    return null;
  }
</script>

<style>
  .content-header {
    margin-top: 30px;
  }

  .section-custom {
    margin-bottom: 30px;
  }

  .has-dark-background {
    background-color: #484848;
    border-color: #484848;
    color: #fff;
  }

  .curl-snippet {
    margin-bottom: 30px;
  }

  .button-url {
    justify-content: start;
  }

  .section-body-control-item {
    margin-bottom: 10px;
  }
</style>

<CollapsiblePanel {show}>
  <span slot="heading">API Playground</span>
  <div slot="body">
    <div class="columns">
      <div class="column">
        {#if copying}
          <button
            class="button button-left is-warning is-family-code is-fullwidth">
            <span>URL has been copied to clipboard.</span>
          </button>
        {:else}
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a
            href="javascript:void(0)"
            on:click={handleCopy}
            class="button button-left is-warning is-family-code is-fullwidth
            button-url">
            <span class="is-uppercase has-text-weight-bold">
              {transition.method}
            </span>
            &nbsp;
            <span>{fullUrl.origin}</span>
            <span class="has-text-weight-bold">{fullUrl.pathname}</span>
          </a>
        {/if}
      </div>

      <div class="column is-one-fifth">
        {#if isSendEnabled}
          <button class="button is-success is-fullwidth" on:click={handleSend}>
            <span class="icon">
              <i class="fas fa-paper-plane" />
            </span>
            <span>Send</span>
          </button>
        {:else if isOauth2}
          <LoginButton
            authOptions={environment.auth.options}
            codeChallenge={challengePair.codeChallenge}
            {codeState} />
        {/if}
      </div>
    </div>

    <div class="curl-snippet">
      <pre>{formatCurl(curl)}</pre>
    </div>

    <div class="tabs is-boxed">
      <ul>
        <li class:is-active={requestTab === 0}>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="javascript:void(0)" on:click={() => handleTab(0)}>
            Parameters
          </a>
        </li>
        <li class:is-active={requestTab === 1}>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="javascript:void(0)" on:click={() => handleTab(1)}>Headers</a>
        </li>
        <li class:is-active={requestTab === 2}>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a href="javascript:void(0)" on:click={() => handleTab(2)}>Body</a>
        </li>
      </ul>
    </div>

    <div class="section-custom">
      <div class="section-parameters" class:is-hidden={requestTab != 0}>
        {#if requestParameters.length === 0}
          <p class="has-text-centered">
            <em>No configurable parameters.</em>
          </p>
        {:else}
          {#each requestParameters as param}
            <FieldSwitch
              name={param.name}
              required={param.required}
              bind:used={param.used}
              bind:value={param.example}
              rounded={false} />
          {/each}
        {/if}
      </div>

      <div class="section-headers" class:is-hidden={requestTab != 1}>
        {#if requestHeaders.length === 0}
          <p class="has-text-centered">
            <em>No configurable headers.</em>
          </p>
        {:else}
          {#each requestHeaders as header}
            <FieldSwitch
              name={header.name}
              required={header.required}
              bind:used={header.used}
              bind:value={header.example}
              rounded={true} />
          {/each}
        {/if}
      </div>

      <div class="section-body" class:is-hidden={requestTab != 2}>
        {#if isAllowBody(transition.method)}
          <div class="control section-body-control">
            <select
              class="section-body-control-item"
              bind:value={bodyLang}
              >
              {#each editorSupportedLanguages as language}
                <option value="{language.lang}">{language.description}</option>
              {/each}
            </select>
          </div>
          <div class="section-body">
            <AceEditor
              bind:value={requestBody}
              theme={ $darkMode ? "clouds_midnight" : "clouds" }
              lang={bodyLang}
              width="100%"
              height="512"
              on:input={onEditorChange}
            />
          </div>
        {:else}
          <p class="has-text-centered">
            <em>Body is only available for POST, PUT and PATCH.</em>
          </p>
        {/if}
      </div>
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
