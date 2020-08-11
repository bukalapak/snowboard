import React from "react";
import ReactJson from "react-json-view";
import { jsonParse as JSONParse } from "snowboard-theme-helper";
import { styled } from "baseui";
import { useTheme } from "../lib/theme";

const fontFamily = 'Consolas, "Liberation Mono", Menlo, Courier, monospace';

const CodeBlock = styled("pre", ({ $theme }) => ({
  backgroundColor: $theme.colors.backgroundSecondary,
  color: $theme.colors.contentPrimary,
  fontFamily: fontFamily,
}));

export default function JSONTree({ src, contentType = "" }) {
  const { darkMode } = useTheme();

  if (contentType.match(/json/)) {
    const { value } = JSONParse(src);

    if (value) {
      return (
        <ReactJson
          src={value}
          enableClipboard={false}
          theme={darkMode ? "summerfruit" : "summerfruit:inverted"}
          name={false}
          iconStyle="square"
          displayObjectSize={true}
          displayDataTypes={false}
          collapsed={2}
          style={{
            paddingBottom: "12px",
            paddingTop: "12px",
            paddingRight: "12px",
            paddingLeft: "16px",
            fontFamily: fontFamily,
            fontSize: "1rem",
            lineHeight: "1.25",
            borderRadius: "4px",
          }}
        />
      );
    }
  }

  return <CodeBlock>{src}</CodeBlock>;
}
