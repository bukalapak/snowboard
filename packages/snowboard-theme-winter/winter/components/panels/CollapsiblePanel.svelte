<script>
  import { darkMode } from "../../lib/store";
  import ToggleButton from "../buttons/ToggleButton.svelte";

  export let show = false;
</script>

<style>
  .panel-section {
    padding: 1em;
  }

  .panel-button {
    border-radius: 4px;
  }

  .is-darkmode .panel-heading {
    border: 1px solid #363636;
  }

  .is-darkmode .panel-section {
    background-color: #222 !important;
    border-color: #333;
  }
</style>

<div class="panel" class:is-darkmode={$darkMode}>
  <div
    class="panel-heading"
    class:has-background-dark={$darkMode}
    class:has-text-white={$darkMode}
    class:panel-button={!show}>
    <slot name="heading" />
    <ToggleButton
      {show}
      additionalClass={$darkMode ? 'has-text-grey is-pulled-right' : 'is-pulled-right'}
      handleClick={() => (show = !show)} />
  </div>
  <div class="panel-section" class:is-hidden={!show}>
    <slot name="body" />
  </div>
</div>
