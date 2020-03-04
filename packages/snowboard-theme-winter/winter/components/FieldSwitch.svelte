<script>
  import { darkMode } from "../lib/store";

  export let used;
  export let required;
  export let name;
  export let value;
  export let rounded;
</script>

<style>
  .control-switch {
    padding-top: 0.4rem;
  }

  .has-border {
    border-color: #dbdbdb;
  }

  .has-dark-background {
    background-color: #484848;
    border-color: #484848;
    color: #fff;
  }
</style>

<div class="field has-addons">
  <p class="control control-switch">
    <input
      class="switch is-success"
      class:is-rounded={rounded}
      id="p-{name}"
      type="checkbox"
      bind:checked={used}
      disabled={required} />
    <label for="p-{name}" />
  </p>
  <p class="control">
    <input
      class="input"
      class:is-rounded={rounded}
      class:has-border={!$darkMode}
      type="text"
      placeholder={name}
      disabled />
  </p>
  <p class="control is-expanded">
    <input
      class="input has-border is-family-code"
      class:is-rounded={rounded}
      class:has-dark-background={$darkMode}
      type="text"
      bind:value />
  </p>
</div>
