<script>
  import { env, auth } from "../store.js";
  import { removeToken } from "../util.js";

  function handleClick() {
    auth.remove($env);
    removeToken($env);
  }
</script>

<a href="javascript:void(0)" class="button is-light" on:click={handleClick}>
  <span class="icon has-text-grey">
    <i class="fas fa-sign-out-alt" aria-hidden="true" />
  </span>
  <span>Logout</span>
</a>
