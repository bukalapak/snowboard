import remark from "remark";
import markdown from "remark-parse";

export default async function (source) {
  const data = [];

  const tocProcessor = remark()
    .use(markdown)
    .use(() => {
      return (node) => {
        const headings = node.children.filter(
          (child) => child.type === "heading"
        );

        headings.forEach((head) => {
          data.push({
            text: head.children[0].value,
            depth: head.depth,
          });
        });
      };
    });

  await tocProcessor.process(source);
  return data;
}
