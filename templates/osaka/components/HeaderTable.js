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
        <SmallerHeadCell>Header</SmallerHeadCell>
        <StyledHeadCell>Value</StyledHeadCell>
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
