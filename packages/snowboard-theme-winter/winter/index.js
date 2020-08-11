import App from "./App.svelte";
import seeds from "./seeds";
import "./index.css";

const format = (seeds) => {
  const { transitions, ...rest } = seeds;
  return rest;
};

const app = new App({
  target: document.getElementById("root"),
  props: format(seeds),
});

export default app;
