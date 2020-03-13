import { httpClient } from "snowboard-theme-helper";

export const sendRequest = ({
  environment,
  method,
  pathTemplate,
  headers,
  parameters,
  body,
  httpConfig
}) => {
  const [client, options] = httpClient({
    environment,
    method,
    pathTemplate,
    headers,
    parameters,
    body,
    httpConfig
  });

  return client.request(options);
};
