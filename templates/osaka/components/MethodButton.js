import React from "react";
import { Button } from "baseui/button";
import { ButtonGroup } from "baseui/button-group";
import { colors } from "baseui/tokens";

const monospaceFontFamily =
  'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace';

const colorMap = {
  GET: colors.green500,
  POST: colors.blue500,
  PUT: colors.yellow500,
  PATCH: colors.orange500,
  DELETE: colors.red500
};

export default ({ method, path }) => {
  return (
    <ButtonGroup>
      <Button
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                fontWeight: "700",
                fontFamily: monospaceFontFamily,
                outline: `solid 2px ${$theme.colors.primary}`
              };
            }
          }
        }}
      >
        {method}
      </Button>
      <Button
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                paddingTop: $theme.sizing.scale100,
                paddingBottom: $theme.sizing.scale100,
                paddingRight: $theme.sizing.scale100,
                paddingLeft: $theme.sizing.scale100,
                backgroundColor: colorMap[method],
                outline: `solid 2px ${$theme.colors.primary}`
              };
            }
          }
        }}
      ></Button>
      <Button
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                width: "100%",
                justifyContent: "left",
                fontFamily: monospaceFontFamily,
                outline: `solid 2px ${$theme.colors.primary}`
              };
            }
          }
        }}
      >
        {path}
      </Button>
    </ButtonGroup>
  );
};
