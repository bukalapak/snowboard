import { findIndex } from "lodash";
import { clipboardCopy, expandUrl } from "snowboard-theme-helper";
import { isAuth } from "./helper";

export function copyUrl(url, parameters) {
  const expandedUrl = expandUrl(url.pathname, parameters);
  clipboardCopy(url.origin + expandedUrl);
}

export function fullUrl(url, parameters) {
  const expandedUrl = expandUrl(url.pathname, parameters);
  return url.origin + expandedUrl;
}

export function isAllowBody(method) {
  return ["PUT", "POST", "PATCH"].includes(method);
}

export function populate(arr) {
  return arr
    .filter(Boolean)
    .filter((obj) => obj.used)
    .reduce((prev, cur) => {
      prev[cur.name] = cur.example;
      return prev;
    }, {});
}

export function formatCurl(str) {
  return str
    .split(" -H")
    .join(" \\\n -H")
    .split(" --data")
    .join(" \\\n --data");
}

function headerIndex(headers, name) {
  return headers.findIndex(
    (header) => header.name.toLowerCase() === name.toLowerCase()
  );
}

export function prepareHeaders(store, environment, headers) {
  const mapHeaders = headers.map((val) => {
    const header = Object.assign({}, val);
    header.used = true;
    return header;
  });

  if (isAuth(environment, "oauth2")) {
    const index = headerIndex(mapHeaders, "authorization");
    const example = store.token ? `Bearer ${store.token}` : "";

    if (mapHeaders[index]) {
      mapHeaders[index].example = example;
    } else {
      mapHeaders.push({
        name: "Authorization",
        example,
        used: true,
      });
    }
  }

  if (isAuth(environment, "apikey")) {
    const index = headerIndex(mapHeaders, environment.auth.options.header);

    if (mapHeaders[index]) {
      mapHeaders[index].example = environment.auth.options.key;
    } else {
      mapHeaders.push({
        name: environment.auth.options.header,
        example: environment.auth.options.key,
        used: true,
      });
    }
  }

  if (isAuth(environment, "basic")) {
    const index = headerIndex(mapHeaders, "authorization");
    const authDigest = basicAuth(
      environment.auth.options.username,
      environment.auth.options.password
    );

    if (mapHeaders[index]) {
      mapHeaders[index].example = `Basic ${authDigest}`;
    } else {
      mapHeaders.push({
        name: "Authorization",
        example: `Basic ${authDigest}`,
        used: true,
      });
    }
  }

  return mapHeaders;
}

export function updateHeader(obj, name, { value, checked }) {
  const { headers, ...rest } = obj;

  const index = findIndex(headers, (item) => item.name == name);

  if (value != undefined) headers[index].example = value;
  if (checked != undefined) headers[index].used = checked;

  return {
    headers: headers,
    ...rest,
  };
}

export function updateParameter(obj, name, { value, checked }) {
  const { parameters, ...rest } = obj;

  const index = findIndex(parameters, (param) => param.name == name);

  if (value != undefined) parameters[index].example = value;
  if (checked != undefined) parameters[index].used = checked;

  return {
    parameters: parameters,
    ...rest,
  };
}
