<script>
  import { isEmpty } from "lodash";
  import { getToken, removeToken } from "snowboard-theme-helper";
  import { isAuth } from "../../lib/helper";
  import { env, auth, token } from "../../lib/store";

  export let playground;

  let show = false;

  function handleClick(event) {
    show = false;
    const envName = event.target.dataset["name"];

    env.set(envName);

    const authToken = getToken($env);

    if (authToken) {
      auth.add(envName);
      token.set(authToken);
    } else {
      auth.remove(envName);
      token.set(null);
    }
  }

  function toggleClick() {
    show = !show;
  }

  function handleLogout() {
    removeToken($env);
    token.set(null);
  }
</script>

{#if !isEmpty($token)}
  <div class="navbar-item has-dropdown is-capitalized">
    <div class="buttons">
      <a
        href="javascript:void(0)"
        class="button is-dark is-rounded"
        on:click={handleLogout}>
        Logout
      </a>
    </div>
  </div>
{/if}

<div class="navbar-item has-dropdown is-capitalized" class:is-active={show}>
  <a href="javascript:void(0)" class="navbar-link" on:click={toggleClick}>
    {$env}
  </a>

  <div class="navbar-dropdown is-right">
    {#each Object.keys(playground.environments) as envName}
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
