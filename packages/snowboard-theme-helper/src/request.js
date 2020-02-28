import axios from "axios";
import uriTemplate from "uritemplate";
import urlParse from "url-parse";

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
  body
}) => {
  const client = axios.create({
    baseURL: environment.url
  });

  const options = {
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

export { urlParse, expandUrl, sendRequest };
