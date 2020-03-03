import store2 from "store2";
import { random, create as generatePair } from "pkce";

export const store = store2.namespace("snowboard");
const challengePairStore = store.namespace("challenge-pair");
const tokenStore = store.namespace("token");
const refreshTokenStore = store.namespace("refresh-token");

export const getChallengePair = () => {
  if (challengePairStore.keys().length === 0) {
    challengePairStore.setAll(generatePair());
  }

  return challengePairStore.getAll();
};

export const getState = () => {
  if (!store.has("state")) {
    store.set("state", random(16));
  }

  return store.get("state");
};

export const clearChallengePair = () => challengePairStore.clear();
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

export const enableDarkMode = () => store.set("darkMode", true);
export const disableDarkMode = () => store.set("darkMode", false);
export const getDarkMode = () => store.get("darkMode");
