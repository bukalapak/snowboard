<script>
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
</style>

<div class="field has-addons">
  <p class="control control-switch">
    <input
      class="switch is-rounded is-success"
      id="p-{name}"
      type="checkbox"
      bind:checked={used}
      disabled={required} />
    <label for="p-{name}" />
  </p>
  <p class="control">
    <input
      class="input is-rounded has-border"
      type="text"
      placeholder={name}
      disabled />
  </p>
  <p class="control is-expanded">
    <input
      class="input has-border is-family-code"
      class:is-rounded={rounded}
      type="text"
      bind:value />
  </p>
</div>
