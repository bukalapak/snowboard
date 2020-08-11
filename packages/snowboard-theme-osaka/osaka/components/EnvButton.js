import React from "react";
import { Button, SIZE } from "baseui/button";
import ChevronDown from "baseui/icon/chevron-down";
import { StatefulPopover } from "baseui/popover";
import { StatefulMenu } from "baseui/menu";
import { useStore } from "../lib/store";

export default function ({ config }) {
  const { playground } = config;

  if (!playground.enabled) {
    return null;
  }

  const [store, dispatch] = useStore();
  const items = Object.keys(playground.environments).map((value) => ({
    label: value,
  }));

  return (
    <StatefulPopover
      content={({ close }) => (
        <StatefulMenu
          items={items}
          onItemSelect={({ item }) => {
            dispatch({ type: "setEnv", env: item.label });
            close();
          }}
        />
      )}
    >
      <Button
        size={SIZE.mini}
        overrides={{
          BaseButton: {
            style: ({ $theme }) => {
              return {
                paddingLeft: $theme.sizing.scale800,
              };
            },
          },
        }}
        endEnhancer={() => <ChevronDown size={24} />}
      >
        {store.env || playground.env}
      </Button>
    </StatefulPopover>
  );
}
