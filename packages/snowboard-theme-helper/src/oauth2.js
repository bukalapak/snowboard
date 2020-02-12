import axios from "axios";
import oauth from "axios-oauth-client";
import qs from "querystringify";
import uriTemplate from "uritemplate";
import urlParse from "url-parse";

const requestToken = async (client, options) => {
  const authRequest = oauth.client(client, options);
  const authCode = await authRequest();

  if (typeof authCode === "string") {
    const authParsed = qs.parse(authCode);

    return {
      accessToken: authParsed.access_token,
      refreshToken: authParsed.refresh_token
    };
  }

  return {
    accessToken: authCode.access_token,
    refreshToken: authCode.refresh_token
  };
};

export const exchangeToken = async ({
  code,
  state,
  clientId,
  tokenUrl,
  callbackUrl,
  codeVerifier
}) => {
  return requestToken(axios.create(), {
    url: tokenUrl,
    grant_type: "authorization_code",
    state: state,
    client_id: clientId,
    redirect_uri: callbackUrl,
    code: code,
    code_verifier: codeVerifier
  });
};

const expandUrl = (uri, obj) => {
  const tpl = uriTemplate.parse(uri);
  return tpl.expand(obj);
};

const allowBody = method => {
  return ["PUT", "POST", "PATCH"].includes(method);
};

export const sendRequest = ({
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

  if (allowBody(action)) {
    options.data = body;
  }

  return client.request(options);
};
