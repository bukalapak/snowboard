import { filter as filterHelper } from "snowboard-theme-helper";
import { httpClient } from "snowboard-theme-helper";
import seeds from "../seeds";

const {
  config: { basePath },
} = seeds;

export function toHref(permalink) {
  const char = permalink.substr(0, 1);

  if (char == "/") {
    return permalink;
  }

  return permalink
    .replace(`${char}~`, `${basePath}${char}/`)
    .replace(/\/\//g, "/");
}

export function toPermalink(pathname) {
  const segment = pathname.replace(basePath, "");
  const char = segment.substr(0, 1);
  return pathname.replace(`${basePath}${char}/`, `${char}~`);
}

export function filter(query, groups) {
  return filterHelper(query, groups).map((item) => {
    const { permalink, ...rest } = item;

    return {
      ...rest,
      href: toHref(permalink),
    };
  });
}

export const sendRequest = ({
  environment,
  method,
  pathTemplate,
  headers,
  parameters,
  body,
  httpConfig,
}) => {
  const [client, options] = httpClient({
    environment,
    method,
    pathTemplate,
    headers,
    parameters,
    body,
    httpConfig,
  });

  return client.request(options);
};

export function isAuth(environment, name) {
  return environment.auth && environment.auth.name === name;
}

export { basePath };
