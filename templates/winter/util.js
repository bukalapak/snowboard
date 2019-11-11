import Prism from "prismjs";
import marked from "marked";
import getSlug from "speakingurl";
import urlJoin from "url-join";
import uriTemplate from "uritemplate";
import store from "store2";
import urlParse from "url-parse";
import copy from "clipboard-copy";

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

const copyUrl = (url, parameters) => {
  const expandedUrl = expandUrl(url.pathname, populate(parameters));

  copy(url.origin + expandedUrl);
};

const getEnv = () => store.get("env");

export {
  alias,
  allowBody,
  basePath,
  colorize,
  expandUrl,
  filterActions,
  getEnv,
  getToken,
  highlight,
  isAuth,
  markdown,
  populate,
  pushHistory,
  removeToken,
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
