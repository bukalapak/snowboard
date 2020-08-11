import { writable } from "svelte/store";
import { setEnv } from "snowboard-theme-helper";

const env = writable("");
const token = writable("");

env.subscribe((val) => {
  if (val != "") {
    setEnv(val);
  }
});

const darkMode = writable(false);

export { env, token, darkMode };
