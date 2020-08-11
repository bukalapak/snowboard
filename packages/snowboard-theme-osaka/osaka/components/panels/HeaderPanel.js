import React from "react";
import { Block } from "baseui/block";
import FieldSwitch from "../FieldSwitch";

export default function ({ headers, onChange, setChecked }) {
  if (headers.length == 0) {
    return (
      <Block
        overrides={{
          Block: {
            style: { textAlign: "center" },
          },
        }}
      >
        <em>No configurable headers.</em>
      </Block>
    );
  }

  return (
    <Block marginTop="scale400">
      {headers.map((header) => {
        return (
          <FieldSwitch
            key={header.name}
            name={header.name}
            value={header.example}
            used={header.used}
            required={header.required}
            rounded={true}
            onChange={onChange}
            setChecked={setChecked}
          />
        );
      })}
    </Block>
  );
}
