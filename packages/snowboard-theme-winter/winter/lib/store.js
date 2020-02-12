import { writable } from "svelte/store";
import { setEnv } from "snowboard-theme-helper";

const env = writable("");
const token = writable("");

env.subscribe(val => {
  if (val != "") {
    setEnv(val);
  }
});

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

function add(data, val) {
  const arr = data.split(";");
  arr.push(val);

  return arr
    .filter(unique)
    .filter(String)
    .join(";");
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

const darkMode = writable(false);

export { env, auth, token, darkMode };
