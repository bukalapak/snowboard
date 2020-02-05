import React from "react";
import { withStyle } from "baseui";
import {
  StyledTable,
  StyledHead,
  StyledHeadCell,
  StyledBody,
  StyledRow,
  StyledCell
} from "baseui/table";
import { Tag, VARIANT, KIND } from "baseui/tag";
import { Label3, Label1 } from "baseui/typography";
import { Block } from "baseui/block";
import Markdown from "../components/Markdown";

const smallerStyle = ({ $theme }) => {
  return {
    maxWidth: $theme.sizing.scale3200
  };
};

const SmallerCell = withStyle(StyledCell, smallerStyle);

export default function({ parameters }) {
  return (
    <StyledTable>
      <StyledHead>
        <StyledRow>
          <StyledHeadCell span={3}>
            <Label1>Parameters</Label1>
          </StyledHeadCell>
        </StyledRow>
      </StyledHead>
      <StyledBody>
        {parameters.map(parameter => (
          <StyledRow
            key={parameter.name}
            $style={({ $theme }) => ({
              borderBottom: `solid 1px ${$theme.colors.borderOpaque}`
            })}
          >
            <SmallerCell>{parameter.name}</SmallerCell>
            <StyledCell>
              <Tag
                closeable={false}
                variant={VARIANT.light}
                kind={KIND.neutral}
              >
                {parameter.schema.type}
              </Tag>
              {parameter.required && (
                <Tag
                  closeable={false}
                  variant={VARIANT.solid}
                  kind={KIND.neutral}
                >
                  required
                </Tag>
              )}
            </StyledCell>
            <StyledCell>
              <Block>
                <Markdown source={parameter.description} />
                {parameter.example && (
                  <Label3>
                    Example: <code>{parameter.example}</code>
                  </Label3>
                )}
              </Block>
            </StyledCell>
          </StyledRow>
        ))}
      </StyledBody>
    </StyledTable>
  );
}
