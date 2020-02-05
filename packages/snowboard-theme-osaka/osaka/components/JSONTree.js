import React from "react";
import ReactJson from "react-json-view";
import { jsonParse as JSONParse } from "snowboard-theme-helper";
import { styled } from "baseui";
import { useTheme } from "../lib/theme";

const Pre = styled("pre", ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundInv
}));

export default function JSONTree({ src, contentType = "" }) {
  const { darkMode } = useTheme();

  if (contentType.match(/json/)) {
    const { value } = JSONParse(src);

    if (!value) {
      return <Pre>{src}</Pre>;
    }

    return (
      <ReactJson
        src={value}
        enableClipboard={false}
        theme={darkMode ? "summerfruit" : "summerfruit:inverted"}
        name={false}
        iconStyle="square"
        displayObjectSize={true}
        displayDataTypes={false}
        style={{
          paddingBottom: "12px",
          paddingTop: "12px",
          paddingRight: "12px",
          paddingLeft: "16px",
          fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
          fontSize: "1rem",
          lineHeight: "1.25",
          borderRadius: "4px"
        }}
      />
    );
  }

  return <Pre>{src}</Pre>;
}
