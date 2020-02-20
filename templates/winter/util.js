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
import pkce from "pkce";
import { navigateTo } from "yrv";
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
  if (typeof obj === "string") {
    return obj;
  }

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

function escape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const filterActions = (tagActions, query) => {
  if (query.startsWith("g:")) {
    const slugs = query.substr(2).split("~");
    return tagActions
      .map(tag => {
        const children = tag.children.filter(child => {
          return (
            slugify(child.title) === slugs[1] && slugify(tag.title) === slugs[0]
          );
        });

        return filteredItem(tag.title, "children", children.filter(Boolean));
      })
      .filter(Boolean);
  }

  if (query.startsWith("rg:")) {
    return tagActions
      .map(tag => {
        const children = tag.children.filter(
          () => slugify(tag.title) === query.substr(3)
        );

        return filteredItem(tag.title, "children", children.filter(Boolean));
      })
      .filter(Boolean);
  }

  const regex = new RegExp(escape(query), "gi");

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

const tokenStore = store.namespace("token");

const setToken = (env, token) => tokenStore.set(env, token);
const getToken = env => tokenStore.get(env);
const removeToken = env => tokenStore.remove(env);

const refreshTokenStore = store.namespace("refresh-token");
const setRefreshToken = (env, token) => refreshTokenStore.set(env, token);
const getRefreshToken = env => refreshTokenStore.get(env);
const removeRefreshToken = env => refreshTokenStore.remove(env);

const isAuth = (environment, name) => {
  return environment.auth && environment.auth.name === name;
};

const isPKCE = environment => {
  if (isAuth(environment, "oauth2")) {
    return environment.auth.options.clientSecret === undefined;
  }

  return false;
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

const exchangeToken = async (code, options, isPKCE, pkceChallenge) => {
  if (isPKCE) {
    return requestToken(axios.create(), {
      url: options.tokenUrl,
      grant_type: "authorization_code",
      state: getState(),
      client_id: options.clientId,
      redirect_uri: options.callbackUrl,
      code: code,
      code_verifier: pkceChallenge.codeVerifier
    });
  }

  return requestToken(axios.create(), {
    url: options.tokenUrl,
    grant_type: "authorization_code",
    state: getState(),
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
      state: getState(),
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

const copyUrl = (url, parameters) => {
  const expandedUrl = expandUrl(url.pathname, populate(parameters));

  copy(url.origin + expandedUrl);
};

const getEnv = () => store.get("env");

const pkceStore = store.namespace("pkce");

const getPKCE = () => {
  const existing = pkceStore.getAll();

  if (Object.keys(existing).length === 0) {
    const challengePair = pkce.create();
    pkceStore.setAll(challengePair);

    return challengePair;
  }

  return existing;
};

const getState = () => {
  const existing = store.get("state");
  if (existing) return existing;

  const state = pkce.random(16);
  store.set("state", state);
  return state;
};

const clearPKCE = () => pkceStore.clear();
const clearState = () => store.remove("state");

const handleLink = event => {
  event.preventDefault();

  let href = event.target.getAttribute("href");

  if (!href) {
    href = event.target.parentElement.getAttribute("href");
  }

  navigateTo(href.substr(2));
};

export {
  alias,
  allowBody,
  basePath,
  colorize,
  clearPKCE,
  clearState,
  exchangeToken,
  expandUrl,
  filterActions,
  getEnv,
  getToken,
  getPKCE,
  getState,
  highlight,
  isAuth,
  isPKCE,
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
  copyUrl,
  handleLink
};
