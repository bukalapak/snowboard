import React from "react";
import ReactJson from "react-json-view";
import JSONParse from "json-parse-safe";
import { Code } from "@chakra-ui/core";

export default function JSONTree({ src, contentType = "" }) {
  if (contentType.match(/json/)) {
    const { value } = JSONParse(src);

    if (!value) {
      return <PlainCode src={src} />;
    }

    return (
      <ReactJson
        src={value}
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

  return <PlainCode src={src} />;
}

function PlainCode({ src }) {
  return (
    <Code whiteSpace="pre-wrap" px="6" py="4" w="full">
      {src}
    </Code>
  );
}
