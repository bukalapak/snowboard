<script>
  import LoginButton from "../components/LoginButton.svelte";
  import LogoutButton from "../components/LogoutButton.svelte";

  import { env, auth, token } from "../store.js";
  import { isAuth, getToken } from "../util.js";

  export let environments;
  export let authenticating;
  export let pkceChallenge;

  let show = false;

  $: environment = environments[$env];

  function handleClick(event) {
    show = false;
    const envName = event.target.dataset["name"];

    env.set(envName);

    const authToken = getToken($env);

    if (authToken) {
      auth.add(envName);
      token.set(authToken);
    }
  }

  function toggleClick() {
    show = !show;
  }
</script>

<style>
  .icon-info {
    cursor: pointer;
  }

  .content {
    padding: 1rem 1.5rem;
  }
</style>

{#if isAuth(environment, 'oauth2')}
  {#if authenticating}
    <div class="navbar-item">
      <span class="icon is-medium has-text-danger">
        <i class="fas fa-2x fa-spinner fa-pulse" />
      </span>
    </div>
  {:else if $auth.includes($env)}
    <div class="navbar-item">
      <div class="field is-grouped">
        <p class="control">
          <LogoutButton />
        </p>
      </div>
    </div>
  {:else}
    <div class="navbar-item">
      <div class="field is-grouped">
        <p class="control">
          <LoginButton
            authOptions={environment.auth.options}
            isPKCE={isAuth(environment, 'oauth2-pkce')}
            {pkceChallenge} />
        </p>
      </div>
    </div>
  {/if}
{/if}

<div class="navbar-item has-dropdown is-capitalized" class:is-active={show}>
  <a href="javascript:void(0)" class="navbar-link" on:click={toggleClick}>
    {$env}
  </a>

  <div class="navbar-dropdown is-right">
    {#each Object.keys(environments) as envName}
      <a
        data-name={envName}
        href="javascript:void(0)"
        class="navbar-item"
        on:click={handleClick}>
        {envName}
      </a>
    {/each}
  </div>
</div>

<div class="navbar-item has-dropdown is-hoverable">
  <a href="javascript:void(0)" class="navbar-link is-arrowless">
    <span class="icon icon-info is-medium has-text-grey-light">
      <i class="fas fa-lg fa-info-circle" />
    </span>
  </a>

  <div class="navbar-dropdown is-right">
    <div class="content">
      <p>BaseURL: {environment.url}</p>
      <p>
        Auth:
        {#if environment.auth}
          <span class="is-capitalized">{environment.auth.name}</span>
        {:else}
          <span class="is-capitalized">None</span>
        {/if}
      </p>
    </div>
  </div>
</div>
