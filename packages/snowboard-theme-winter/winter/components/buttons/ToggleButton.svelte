<script>
  export let show = false;
  export let additionalClass = "";

  export let handleClick;

  function toggle(event) {
    show = !show;
    handleClick(event);
  }
</script>

<style>
  .toggle-icon {
    cursor: pointer;
  }
</style>

<span class="toggle-icon icon {additionalClass}" on:click={toggle}>
  <i class="fas" class:fa-chevron-up={!show} class:fa-chevron-down={show} />
</span>
