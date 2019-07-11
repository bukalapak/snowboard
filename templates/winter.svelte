<script>
  import { onMount } from 'svelte';
  import marked from 'marked';
  import Prism from 'prismjs';

  import Navigation from './winter/Navigation.svelte';
  import Header from './winter/Header.svelte';
  import CodePanel from './winter/CodePanel.svelte';
  import Code from './winter/Code.svelte';
  import RequestPanel from './winter/RequestPanel.svelte';
  import ResponsePanel from './winter/ResponsePanel.svelte';

	onMount(() => {
    Prism.languages.json = {
      'property': {
        pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
        greedy: true
      },
      'string': {
        pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
        greedy: true
      },
      'comment': /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
      'number': /-?\d+\.?\d*(e[+-]?\d+)?/i,
      'punctuation': /[{}[\],]/,
      'operator': /:/,
      'boolean': /\b(?:true|false)\b/,
      'null': {
        pattern: /\bnull\b/,
        alias: 'keyword'
      }
    };
  });

  export let title;
  export let description;
  export let actions;
  export let tagActions;

  export let index = -1;
  export let currentAction;

  // set HTML title
  document.title = title;

  $: currentAction = actions[index];

  function handleClick(event) {
    const slug = event.target.dataset["slug"];
    index = actions.findIndex((el) => el.slug === slug);
  }

  function toc(source) {
    const tokens = marked.lexer(source);
    const headings = tokens.filter(elem => elem.type === "heading");
    const depths = headings.map(head => head.depth);
    const minDepth = Math.min(...depths);

    return headings.map(head => ({
      text: head.text,
      level: head.depth - minDepth
    }));
  }

  function colorize(str) {
    switch (str) {
      case "get":
        return "is-primary";
      case "post":
        return "is-info";
      case "put":
        return "is-link";
      case "patch":
        return "is-warning";
      case "delete":
        return "is-danger";
      case 200:
      case 201:
      case 202:
      case 204:
        return "is-info";
      case 401:
      case 403:
      case 404:
      case 422:
        return "is-warning";
      case 500:
        return "is-danger";
    }
  }

  function upcase(str) {
    return str && str.toUpperCase();
  }
</script>

<style>
  .main-section {
    padding: 1.5rem;
  }

  .breadcrumb-right {
    margin-top: .30em;
  }

  .box-wrapper {
    border-radius: 0;
  }
</style>

<section class="main-section">
  <div class="columns">
    <div class="column is-one-third">
      <Navigation
        tagActions={tagActions}
        tagHeaders={toc(description)}
        currentSlug={currentAction && currentAction.slug}
        colorize={colorize}
        handleClick={handleClick} />
    </div>

    <div class="column is-two-thirds">
      {#if index === -1}
        <h1 class="title">{title}</h1>
        <hr>
        <div class="content">{@html marked(description)}</div>
      {/if}

      {#if currentAction}
      <nav class="breadcrumb breadcrumb-right is-pulled-right" aria-label="breadcrumbs">
        <ul>
          {#each currentAction.tags as tag}
            <li><a href="javascript:void(0)">{tag}</a></li>
          {/each}
        </ul>
      </nav>

      <h1 class="title">{currentAction.title}</h1>

      <hr>

      <div class="tags has-addons are-large">
        <code class="tag {colorize(currentAction.method)}">{upcase(currentAction.method)}</code>
        <code class="tag ">{currentAction.path}</code>
      </div>

      <div class="content">{@html marked(currentAction.description)}</div>

      {#each currentAction.transactions as { request, response }, index}
        <div class="box box-wrapper has-background-white-bis">
          <RequestPanel title={request.title}
            description={request.description}
            headers={request.headers}
            contentType={request.contentType}
            example={request.example}
            schema={request.schema}
            />

          <ResponsePanel
            title={response.title}
            description={response.description}
            statusCode={response.statusCode}
            headers={response.headers}
            contentType={response.contentType}
            example={response.example}
            schema={response.schema}
            colorize={colorize}
            />
        </div>

        {#if (index !== (currentAction.transactions.length - 1))}
          <hr />
        {/if}
      {/each}
      {/if}
    </div>
  </div>
</section>
