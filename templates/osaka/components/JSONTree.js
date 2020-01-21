import React from "react";
import ReactJson from "react-json-view";
import JSONParse from "json-parse-safe";
import { styled } from "baseui";

const Pre = styled("pre", ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundInv
}));

export default function JSONTree({ src, contentType = "" }) {
  if (contentType.match(/json/)) {
    const { value } = JSONParse(src);

    if (!value) {
      return <Pre>{src}</Pre>;
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

  return <Pre>{src}</Pre>;
}
