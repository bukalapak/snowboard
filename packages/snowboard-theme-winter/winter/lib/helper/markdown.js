import marked from "marked";
import highlight from "./highlight";

marked.setOptions({
  highlight,
});

const renderer = new marked.Renderer();

renderer.pre = renderer.code;
renderer.code = function (code, infostring, escaped) {
  const out = this.pre(code, infostring, escaped);
  return out.replace("<pre>", `<pre class="language-${infostring}">`);
};

export default function (source) {
  return source ? marked(source, { renderer: renderer }) : "";
}
