import Prism from "prismjs";
import marked from "marked";
import getSlug from "speakingurl";
import urlJoin from "url-join";
import uriTemplate from "uritemplate";
import store from "store2";
import axios from "axios";
import oauth from "axios-oauth-client";
import qs from "querystringify";
import urlParse from "url-parse";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import copy from "clipboard-copy";
import { token } from "./store";

Prism.languages.json = {
  property: {
    pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
    greedy: true
  },
  string: {
    pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
    greedy: true
  },
  comment: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
  number: /-?\d+\.?\d*(e[+-]?\d+)?/i,
  punctuation: /[{}[\],]/,
  operator: /:/,
  boolean: /\b(?:true|false)\b/,
  null: {
    pattern: /\bnull\b/,
    alias: "keyword"
  }
};

const highlight = function(code, lang) {
  const supported = ["xml", "json"];

  if (!supported.includes(lang)) {
    lang = "markup";
  }

  return Prism.highlight(code, Prism.languages[lang], lang);
};

marked.setOptions({
  highlight
});

const renderer = new marked.Renderer();

renderer.pre = renderer.code;
renderer.code = function(code, infostring, escaped) {
  const out = this.pre(code, infostring, escaped);
  return out.replace("<pre>", `<pre class="language-${infostring}">`);
};

const markdown = function(source) {
  return source ? marked(source, { renderer: renderer }) : "";
};

const toc = function(source) {
  if (!source) {
    return [];
  }

  const tokens = marked.lexer(source);
  const headings = tokens.filter(elem => elem.type === "heading");
  const depths = headings.map(head => head.depth);
  const minDepth = Math.min(...depths);

  return headings.map(head => ({
    text: head.text,
    level: head.depth - minDepth
  }));
};

const colorize = function(str, prefix = "is-") {
  switch (str) {
    case "get":
      return `${prefix}success`;
    case "post":
      return `${prefix}link`;
    case "put":
      return `${prefix}primary`;
    case "patch":
      return `${prefix}info`;
    case "delete":
      return `${prefix}danger`;
    case 200:
    case 201:
    case 202:
    case 204:
      return `${prefix}info`;
    case 401:
    case 403:
    case 404:
    case 422:
      return `${prefix}warning`;
    case 500:
      return `${prefix}danger`;
  }
};

const slugify = function(str) {
  return getSlug(str, "-");
};

const alias = str => {
  return str && str.match("json") ? "json" : "markup";
};

const stringify = obj => {
  if (obj) {
    return JSON.stringify(obj, null, "  ");
  }

  return "";
};

const expandUrl = (uri, obj) => {
  const tpl = uriTemplate.parse(uri);
  return tpl.expand(obj);
};

const actionFilter = (act, regex) => {
  return (
    act.path.match(regex) || act.method.match(regex) || act.title.match(regex)
  );
};

const filteredItem = (title, key, items) => {
  if (items.length === 0) {
    return false;
  }

  return { title: title, [key]: items };
};

const filterActions = (tagActions, regex) => {
  return tagActions
    .map(tag => {
      const children = tag.children.map(child => {
        const actions = child.actions.filter(act => actionFilter(act, regex));
        return filteredItem(child.title, "actions", actions);
      });

      return filteredItem(tag.title, "children", children.filter(Boolean));
    })
    .filter(Boolean);
};

const basePath = config => {
  if (config.basePath.endsWith("/")) {
    return config.basePath;
  } else {
    return config.basePath + "/";
  }
};

const tokenName = env => `token:${env}`;
const setToken = (env, token) => store.session.set(tokenName(env), token);
const getToken = env => store.session.get(tokenName(env));
const removeToken = env => store.session.remove(tokenName(env));

const refreshTokenName = env => `refresh-token:${env}`;
const setRefreshToken = (env, token) =>
  store.session.set(refreshTokenName(env), token);
const getRefreshToken = env => store.session.get(refreshTokenName(env));
const removeRefreshToken = env => store.session.remove(refreshTokenName(env));

const isAuth = (environment, name) => {
  return environment.auth && environment.auth.name === name;
};

const pushHistory = href => history.pushState(history.state, "", href);

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

const populate = arr => {
  return arr
    .filter(obj => obj.used)
    .reduce((prev, cur) => {
      prev[cur.name] = cur.value;
      return prev;
    }, {});
};

const allowBody = action => {
  return ["put", "post", "patch"].includes(action.method);
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

const sendRequest = (
  env,
  environment,
  action,
  { headers, parameters, body }
) => {
  const client = axios.create({
    baseURL: environment.url
  });

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

  if (isAuth(environment, "oauth2")) {
    createAuthRefreshInterceptor(
      client,
      refreshInterceptor(env, environment.auth.options)
    );
  }

  return client.request(options);
};

const copyUrl = (action, parameters) => {
  const expandedUrl = expandUrl(action.pathTemplate, populate(parameters));
  const destUrl = urlParse(expandedUrl, true);

  copy(destUrl.origin + destUrl.pathname);
};

const getEnv = () => store.get("env");

export {
  alias,
  allowBody,
  basePath,
  colorize,
  exchangeToken,
  expandUrl,
  filterActions,
  getEnv,
  getToken,
  highlight,
  isAuth,
  markdown,
  pushHistory,
  removeToken,
  sendRequest,
  setToken,
  slugify,
  stringify,
  toc,
  urlJoin,
  urlParse,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  copyUrl
};
