import React from "react";
import { Block } from "baseui/block";
import JSONTree from "../JSONTree";

export default function ({ response }) {
  return (
    <>
      <Block
        overrides={{
          Block: {
            style: ({ $theme }) => {
              return {
                backgroundColor: $theme.colors.positive,
                marginTop: $theme.sizing.scale600,
                paddingTop: $theme.sizing.scale600,
                paddingBottom: $theme.sizing.scale600,
                paddingLeft: $theme.sizing.scale800,
                paddingRight: $theme.sizing.scale800,
                color: $theme.colors.contentPrimary,
                ...$theme.typography.font550,
              };
            },
          },
        }}
      >
        {response.status} {response.statusText}
      </Block>
      <JSONTree
        src={Object.keys(response.headers)
          .map((key) => `${key}:\t\t${response.headers[key]}`)
          .join("\n")}
        contentType={"text/plain"}
      />
      <JSONTree
        src={JSON.stringify(response.data)}
        contentType={"application/json"}
      />
    </>
  );
}
