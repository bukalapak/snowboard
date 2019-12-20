import fetch from "isomorphic-unfetch";
import xxhash from "xxhashjs";

function shortHash(str) {
  return xxhash.h64(str, 0xad1fc).toString(16);
}

const basePath = "/__json__/";

async function fetchJSON(path) {
  const fullPath = `${basePath}${path}.json`;
  const res = await fetch(fullPath);
  const data = await res.json();

  return data;
}

async function index() {
  return fetchJSON("index");
}

async function page(id) {
  const hash = shortHash(id);
  return fetchJSON(hash);
}

export default {
  index,
  page
};
