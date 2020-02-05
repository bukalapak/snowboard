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
import { Label2 } from "baseui/typography";

const smallerStyle = ({ $theme }) => {
  return {
    maxWidth: $theme.sizing.scale4800
  };
};

const SmallerHeadCell = withStyle(StyledHeadCell, smallerStyle);
const SmallerCell = withStyle(StyledCell, smallerStyle);

export default function({ headers }) {
  return (
    <StyledTable>
      <StyledHead>
        <SmallerHeadCell span={2}>
          <Label2>Headers</Label2>
        </SmallerHeadCell>
      </StyledHead>
      <StyledBody>
        {headers.map(header => (
          <StyledRow key={header.name}>
            <SmallerCell>{header.name}</SmallerCell>
            <StyledCell>{header.example}</StyledCell>
          </StyledRow>
        ))}
      </StyledBody>
    </StyledTable>
  );
}
