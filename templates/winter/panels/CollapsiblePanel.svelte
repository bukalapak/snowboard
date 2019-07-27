<script>
  import ToggleIcon from "../components/ToggleIcon.svelte";

  export let dark = false;
  export let show = false;
</script>

<style>
  .panel-section {
    padding: 1em;
    border: 1px solid #dbdbdb;
    border-top: none;
  }

  .panel-button {
    border-radius: 4px;
  }

  .panel-dark {
    border: 1px solid #363636;
  }
</style>

<div class="panel">
  <div
    class="panel-heading"
    class:has-background-dark={dark}
    class:has-text-white={dark}
    class:panel-dark={dark}
    class:panel-button={!show}>
    <slot name="heading" />
    <ToggleIcon
      {dark}
      {show}
      additionalClass="is-pulled-right"
      handleClick={() => (show = !show)} />
  </div>
  <div class="panel-section has-background-white" class:is-hidden={!show}>
    <slot name="body" />
  </div>
</div>
