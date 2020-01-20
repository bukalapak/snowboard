import App from "./App.svelte";
import seeds from "./seeds";

const app = new App({
  target: document.getElementById("root"),
  props: seeds
});

export default app;
