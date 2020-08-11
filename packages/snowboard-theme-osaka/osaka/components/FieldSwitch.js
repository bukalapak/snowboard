import React from "react";
import { Input, SIZE } from "baseui/input";
import { Checkbox, STYLE_TYPE, LABEL_PLACEMENT } from "baseui/checkbox";

export default function ({
  name,
  value,
  required,
  used,
  rounded,
  onChange,
  setChecked,
}) {
  return (
    <>
      <Checkbox
        checked={used}
        disabled={required}
        checkmarkType={rounded ? STYLE_TYPE.toggle_round : STYLE_TYPE.toggle}
        onChange={(event) => setChecked(event, name)}
        labelPlacement={LABEL_PLACEMENT.right}
        overrides={{
          ToggleTrack: {
            style: ({ $theme }) => ({
              marginTop: $theme.sizing.scale400,
            }),
          },
          Label: {
            style: ({ $theme }) => ({
              width: "100%",
            }),
          },
          Root: {
            style: ({ $theme }) => {
              return {
                marginBottom: $theme.sizing.scale400,
              };
            },
          },
        }}
      >
        <Input
          value={value}
          onChange={(event) => onChange(event, name)}
          size={SIZE.compact}
          startEnhancer={name}
          disabled={!used}
          overrides={{
            Input: {
              style: ({ $theme }) => {
                return {
                  backgroundColor: $theme.colors.backgroundSecondary,
                };
              },
            },
            StartEnhancer: {
              style: ({ $theme }) => {
                return {
                  width: "30%",
                };
              },
            },
          }}
        />
      </Checkbox>
    </>
  );
}
