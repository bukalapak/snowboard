import React from "react";
import ReactJson from "react-json-view";
import { Code } from "@chakra-ui/core";

export default function JSONTree({ src, contentType = "" }) {
  if (contentType.match(/json/)) {
    return (
      <ReactJson
        src={JSON.parse(src)}
        enableClipboard={false}
        theme="hopscotch"
        name={false}
        displayDataTypes={false}
        style={{
          padding: "12px",
          paddingLeft: "16px",
          fontFamily: "monospace",
          fontSize: "1.3rem",
          lineHeight: "1.25",
          borderRadius: "8px"
        }}
      />
    );
  }

  return (
    <Code whiteSpace="pre-wrap" px="6" py="4" w="full">
      {src}
    </Code>
  );
}
