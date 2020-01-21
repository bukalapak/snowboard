import axios from "axios";

const basePath = "/__json__/";

export async function fetchJSON(uuid) {
  const fullPath = `${basePath}${uuid}.json`;
  const { data } = await axios.get(fullPath);

  return data;
}

export async function page(uuid) {
  return fetchJSON(uuid);
}
