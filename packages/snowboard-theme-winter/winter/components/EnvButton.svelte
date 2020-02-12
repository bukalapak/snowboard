<script>
  import { getToken } from "snowboard-theme-helper";
  import { env, auth, token } from "../lib/store";

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
</script>

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
