import Prism from "prismjs";

Prism.languages.json = {
  property: {
    pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
    greedy: true,
  },
  string: {
    pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
    greedy: true,
  },
  comment: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
  number: /-?\d+\.?\d*(e[+-]?\d+)?/i,
  punctuation: /[{}[\],]/,
  operator: /:/,
  boolean: /\b(?:true|false)\b/,
  null: {
    pattern: /\bnull\b/,
    alias: "keyword",
  },
};

export default function (code, lang) {
  const supported = ["xml", "json"];

  if (!supported.includes(lang)) {
    lang = "markup";
  }

  return Prism.highlight(code, Prism.languages[lang], lang);
}
