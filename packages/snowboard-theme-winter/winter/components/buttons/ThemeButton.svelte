<script>
  import {
    getDarkMode,
    enableDarkMode,
    disableDarkMode
  } from "snowboard-theme-helper";
  import { darkMode as darkStore } from "../../lib/store";

  const darkMode = {
    mode: ["light", "dark"],
    active: getDarkMode() || false
  };

  function darkToggle() {
    if (darkMode.active) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }

    darkMode.active = getDarkMode();
    darkStore.set(darkMode.active);

    document.getElementById(
      `bulma-theme-${darkMode.mode[Number(!darkMode.active)]}`
    ).media = "none";

    document.getElementById(
      `bulma-theme-${darkMode.mode[Number(darkMode.active)]}`
    ).media = "";

    document.getElementById(
      `prism-theme-${darkMode.mode[Number(!darkMode.active)]}`
    ).media = "none";

    document.getElementById(
      `prism-theme-${darkMode.mode[Number(darkMode.active)]}`
    ).media = "";
  }
</script>

<a
  href="javascript:void(0)"
  on:click={darkToggle}
  title="Dark Mode"
  class="navbar-link is-arrowless">
  <span class="icon is-medium has-text-grey-light">
    <i
      class="fas fa-lg"
      class:fa-moon={!darkMode.active}
      class:fa-sun={darkMode.active} />
  </span>
</a>
