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

const sendRequest = ({
  environment,
  method,
  pathTemplate,
  headers,
  parameters,
  body,
  axiosConfig
}) => {
  const client = axios.create({
    baseURL: environment.url
  });

  const options = {
    ...(axiosConfig || {}),
    method: method,
    headers: headers
  };

  const expandedUrl = expandUrl(pathTemplate, parameters);
  const destUrl = urlParse(expandedUrl, true);

  options.params = destUrl.query;
  options.url = destUrl.pathname;
  options.data = body;

  return client.request(options);
};

const toCurl = ({
  environment,
  method,
  body,
  headers,
  parameters,
  pathTemplate
}) => {
  const expandedUrl = expandUrl(pathTemplate, parameters);
  const destUrl = urlParse(expandedUrl, true);

  return r2curl({
    url:
      urlJoin(environment.url, destUrl.pathname) +
      qs.stringify(destUrl.query, true),
    method: method,
    data: safeParse(body),
    headers: headers
  });
};

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str;
  }
}

export { urlParse, expandUrl, sendRequest, toCurl };
