import { writable } from "svelte/store";
import store from "store2";

const env = writable("");

env.subscribe(val => {
  if (val != "") {
    store.set("env", val);
  }
});

function add(data, val) {
  return [data, val].filter(String).join(";");
}

function remove(data, val) {
  return data
    .split(";")
    .filter(v => v != val)
    .join(";");
}

function createAuth() {
  const { subscribe, update } = writable("");

  return {
    subscribe,
    add: val => update(data => add(data, val)),
    remove: val => update(data => remove(data, val))
  };
}

const auth = createAuth();

export { env, auth };
