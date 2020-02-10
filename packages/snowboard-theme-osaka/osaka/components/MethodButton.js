import React from "react";
import { Button } from "baseui/button";
import { ButtonGroup } from "baseui/button-group";
import { colors } from "baseui/tokens";
import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";

const monospaceFontFamily =
  'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace';

const colorMap = {
  GET: colors.green500,
  POST: colors.blue500,
  PUT: colors.yellow500,
  PATCH: colors.orange500,
  DELETE: colors.red500
};

export default ({ method, path, pathTemplate }) => {
  return (
    <ButtonGroup>
      <Button
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                color: colorMap[method],
                fontWeight: "700",
                fontFamily: monospaceFontFamily
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
                width: "100%",
                justifyContent: "left",
                fontFamily: monospaceFontFamily
              };
            }
          }
        }}
      >
        <StatefulTooltip
          accessibilityType={"tooltip"}
          content={pathTemplate}
          placement={PLACEMENT.bottomLeft}
        >
          {path}
        </StatefulTooltip>
      </Button>
    </ButtonGroup>
  );
};
