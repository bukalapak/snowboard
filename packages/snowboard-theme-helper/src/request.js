import axios from "axios";
import uriTemplate from "uritemplate";
import urlParse from "url-parse";
import r2curl from "r2curl";
import urlJoin from "url-join";
import qs from "querystringify";

const expandUrl = (uri, obj) => {
  const tpl = uriTemplate.parse(uri);
  return tpl.expand(obj);
};

const httpClient = ({
  environment,
  method,
  pathTemplate,
  headers,
  parameters,
  body,
  httpConfig,
}) => {
  const client = axios.create({
    baseURL: environment.url,
  });

  const options = {
    ...(httpConfig || {}),
    method: method,
    headers: headers,
  };

  const expandedUrl = expandUrl(pathTemplate, parameters);
  const destUrl = urlParse(expandedUrl, true);

  options.params = destUrl.query;
  options.url = destUrl.pathname;
  options.data = body;

  return [client, options];
};

const toCurl = ({
  environment,
  method,
  body,
  headers,
  parameters,
  pathTemplate,
}) => {
  const expandedUrl = expandUrl(pathTemplate, parameters);
  const destUrl = urlParse(expandedUrl, true);

  const str = r2curl({
    url:
      urlJoin(environment.url, destUrl.pathname) +
      qs.stringify(destUrl.query, true),
    method: method,
    data: safeParse(body),
    headers: headers,
  });

  // r2curl does not support PATCH yet, https://github.com/uyu423/r2curl/blob/master/src/enum/HTTP_METHOD.ts
  if (method === "PATCH") {
    return str.replace("-X GET", "-X PATCH");
  }

  return str;
};

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str;
  }
}

export { urlParse, expandUrl, toCurl, httpClient };
