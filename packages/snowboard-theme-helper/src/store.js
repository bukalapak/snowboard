import store2 from "store2";
import { random, create as generatePair } from "pkce";

const store = store2.namespace("snowboard");
const pkceStore = store.namespace("pkce");
const tokenStore = store.namespace("token");
const refreshTokenStore = store.namespace("refresh-token");

export const getPKCE = () => {
  if (pkceStore.keys().length === 0) {
    pkceStore.setAll(generatePair());
  }

  return pkceStore.getAll();
};

export const getState = () => {
  if (store.has("state")) {
    store.set("state", random(16));
  }

  return store.get("state");
};

export const clearPKCE = () => pkceStore.clear();
export const clearState = () => store.remove("state");

export const setEnv = env => store.set("env", env);
export const getEnv = () => store.get("env");

export const setToken = (env, token) => tokenStore.set(env, token);
export const getToken = env => tokenStore.get(env);
export const removeToken = env => tokenStore.remove(env);

export const setRefreshToken = (env, token) =>
  refreshTokenStore.set(env, token);
export const getRefreshToken = env => refreshTokenStore.get(env);
export const removeRefreshToken = env => refreshTokenStore.remove(env);
