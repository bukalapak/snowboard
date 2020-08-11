import React from "react";
import { withStyle } from "baseui";
import {
  StyledTable,
  StyledHead,
  StyledHeadCell,
  StyledBody,
  StyledRow,
  StyledCell,
} from "baseui/table";
import { Tag, VARIANT, KIND } from "baseui/tag";
import { Label1 } from "baseui/typography";
import { Block } from "baseui/block";
import { SmallMarkdown as Markdown } from "../components/Markdown";

const SmallerCell = withStyle(StyledCell, ({ $theme }) => {
  return {
    maxWidth: $theme.sizing.scale3200,
  };
});

const SmallCell = withStyle(StyledCell, ({ $theme }) => {
  return {
    maxWidth: $theme.sizing.scale4800,
  };
});

export default function ({ parameters }) {
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
        {parameters.map((parameter) => (
          <StyledRow
            key={parameter.name}
            $style={({ $theme }) => ({
              borderBottom: `solid 1px ${$theme.colors.borderOpaque}`,
            })}
          >
            <SmallerCell>{parameter.name}</SmallerCell>
            <SmallCell>
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
            </SmallCell>
            <StyledCell>
              <Block>
                {parameter.description ? (
                  <Markdown
                    source={
                      parameter.description +
                      (parameter.example
                        ? `\n\nExample: \`${parameter.example}\``
                        : "")
                    }
                  />
                ) : (
                  "-"
                )}
              </Block>
            </StyledCell>
          </StyledRow>
        ))}
      </StyledBody>
    </StyledTable>
  );
}
