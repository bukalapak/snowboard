<script>
  export let name;
  export let placeholder;
  export let value;
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
      id="h-{name}"
      type="checkbox"
      checked
      disabled />
    <label for="h-{name}" />
  </p>
  <p class="control">
    <input
      class="input is-rounded has-border"
      type="text"
      {placeholder}
      disabled />
  </p>
  <p class="control is-expanded">
    <input
      class="input is-rounded has-border is-family-code"
      type="text"
      {value}
      disabled />
  </p>
</div>
