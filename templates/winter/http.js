import axios from "axios";
import oauth from "axios-oauth-client";
import qs from "querystringify";
import urlParse from "url-parse";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import ky from "ky";
import { token } from "./store";
import {
  populate,
  getToken,
  expandUrl,
  allowBody,
  isAuth,
  getRefreshToken,
  setToken,
  setRefreshToken
} from "./util";

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

const exchangeToken = async (code, options) => {
  return requestToken(axios.create(), {
    url: options.tokenUrl,
    grant_type: "authorization_code",
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: options.callbackUrl,
    code: code
  });
};

const refreshInterceptor = (env, options) => {
  const refreshToken = getRefreshToken(env);

  return async failedRequest => {
    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    } = await requestToken(axios, {
      url: options.tokenUrl,
      grant_type: "refresh_token",
      client_id: options.clientId,
      client_secret: options.clientSecret,
      refresh_token: refreshToken
    });

    if (newAccessToken) {
      token.set(newAccessToken);
      setToken(env, newAccessToken);
    }

    if (newRefreshToken) {
      setRefreshToken(env, newRefreshToken);
    }

    failedRequest.response.config.headers[
      "Authorization"
    ] = `Bearer ${newAccessToken}`;
  };
};

const buildRequest = (
  env,
  environment,
  action,
  { headers, parameters, body }
) => {
  const options = {
    method: action.method,
    headers: populate(headers)
  };

  if (environment.auth) {
    switch (environment.auth.name) {
      case "basic":
        options.auth = environment.auth.options;
        break;
      case "apikey":
        options.headers[environment.auth.options.header] =
          environment.auth.options.key;
        break;
      case "oauth2":
        options.headers["Authorization"] = `Bearer ${getToken(env)}`;
        break;
    }
  }

  const expandedUrl = expandUrl(action.pathTemplate, populate(parameters));
  const destUrl = urlParse(expandedUrl, true);

  options.params = destUrl.query;
  options.url = destUrl.pathname;

  if (allowBody(action)) {
    options.data = body;
  }

  return options;
};

const axiosSendRequest = (
  env,
  environment,
  action,
  { headers, parameters, body }
) => {
  const client = axios.create({
    baseURL: environment.url
  });

  const options = buildRequest(env, environment, action, {
    headers,
    parameters,
    body
  });

  if (isAuth(environment, "oauth2")) {
    createAuthRefreshInterceptor(
      client,
      refreshInterceptor(env, environment.auth.options)
    );
  }

  return client.request(options);
};

const kySendRequest = async (
  env,
  environment,
  action,
  { headers, parameters, body }
) => {
  const client = ky.create({
    prefixUrl: environment.url
  });

  const options = buildRequest(env, environment, action, {
    headers,
    parameters,
    body
  });

  if (options.data) {
    options.body = JSON.stringify(options.data);
    delete options.data;
  }

  let url = options.url;
  delete options.url;

  const query = qs.stringify(options.params);
  delete options.params;

  if (query != "") {
    url += `?${query}`;
  }

  if (environment.http && environment.http.options) {
    for (let name of Object.keys(environment.http.options)) {
      options[name] = environment.http.options[name];
    }
  }

  const response = await client(url.substr(1), options);
  const responseHeaders = {};

  for (let headerName of response.headers.keys()) {
    responseHeaders[headerName] = response.headers.get(headerName);
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    data: await response.json()
  };
};

const sendRequest = (
  env,
  environment,
  action,
  { headers, parameters, body }
) => {
  if (environment.http && environment.http.client === "fetch") {
    return kySendRequest(env, environment, action, {
      headers,
      parameters,
      body
    });
  }

  return axiosSendRequest(env, environment, action, {
    headers,
    parameters,
    body
  });
};

export { exchangeToken, sendRequest };
