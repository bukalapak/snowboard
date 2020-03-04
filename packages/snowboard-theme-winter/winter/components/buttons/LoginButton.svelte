<script>
  import qs from "querystringify";
  import { store } from "snowboard-theme-helper";
  import { router } from "yrv";

  export let authOptions;
  export let codeChallenge;
  export let codeState;

  $: authorizeParams = qs.stringify(
    {
      client_id: authOptions.clientId,
      redirect_uri: authOptions.callbackUrl,
      response_type: "code",
      state: codeState,
      scope: authOptions.scopes || "",
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    },
    true
  );

  $: authorizeUrl = `${authOptions.authorizeUrl}${authorizeParams}`;

  function handleClick() {
    store.set("redirectTo", $router.path);
    window.location = authorizeUrl;
  }
</script>

<a
  href={authorizeUrl}
  class="button is-dark is-rounded"
  on:click|preventDefault={handleClick}>
  <span class="icon">
    <i class="fas fa-sign-in-alt" aria-hidden="true" />
  </span>
  <span>Login</span>
</a>
