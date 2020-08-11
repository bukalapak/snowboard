import React from "react";
import { Block } from "baseui/block";
import FieldSwitch from "../FieldSwitch";

export default function ({ parameters, onChange, setChecked }) {
  if (parameters.length == 0) {
    return (
      <Block
        overrides={{
          Block: {
            style: { textAlign: "center" },
          },
        }}
      >
        <em>No configurable parameters.</em>
      </Block>
    );
  }

  return (
    <Block marginTop="scale400">
      {parameters.map((param) => {
        return (
          <FieldSwitch
            key={param.name}
            name={param.name}
            value={param.example}
            used={param.used}
            required={param.required}
            onChange={onChange}
            setChecked={setChecked}
          />
        );
      })}
    </Block>
  );
}
