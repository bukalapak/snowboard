import React from "react";
import { Button } from "baseui/button";
import { ButtonGroup } from "baseui/button-group";
import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";

const monospaceFontFamily =
  'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace';

const colorMap = (method, theme) => {
  const data = {
    GET: theme.colors.contentPositive,
    POST: theme.colors.contentAccent,
    PUT: theme.colors.borderAccentLight,
    PATCH: theme.colors.contentWarning,
    DELETE: theme.colors.contentNegative,
  };

  return data[method];
};
export default ({ method, path, pathTemplate }) => {
  return (
    <ButtonGroup>
      <Button
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                color: $theme.colors.contentOnColor,
                backgroundColor: colorMap(method, $theme),
                fontWeight: "700",
                fontFamily: monospaceFontFamily,
              };
            },
          },
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
                fontFamily: monospaceFontFamily,
              };
            },
          },
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
