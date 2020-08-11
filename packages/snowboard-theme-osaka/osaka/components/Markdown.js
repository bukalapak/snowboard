import React from "react";
import ReactMarkdown from "react-markdown";
import speakingUrl from "speakingurl";
import { Block } from "baseui/block";
import { H1, H2, H3, H4, H5, H6 } from "baseui/typography";
import { Paragraph2, Paragraph3 } from "baseui/typography";
import { StyledLink } from "baseui/link";
import { Notification, KIND } from "baseui/notification";
import {
  StyledRoot,
  StyledTable,
  StyledTableHeadCell,
  StyledTableBodyRow,
  StyledTableBodyCell,
  StyledTableBody,
} from "baseui/table-semantic";
import SyntaxHighlighter from "react-syntax-highlighter";

function Heading(props) {
  const attrs = {
    id: speakingUrl(props.children[0].props.value),
    ...props,
  };

  switch (props.level) {
    case 1:
      return <H1 {...attrs} />;
    case 2:
      return <H2 {...attrs} />;
    case 3:
      return <H3 {...attrs} />;
    case 4:
      return <H4 {...attrs} />;
    case 5:
      return <H5 {...attrs} />;
    case 6:
      return <H6 {...attrs} />;
  }
}

function Blockquote({ children }) {
  return (
    <Notification
      overrides={{
        Body: { style: { width: "auto" } },
      }}
      kind={KIND.warning}
    >
      {children}
    </Notification>
  );
}

function Table({ children }) {
  return (
    <StyledRoot>
      <StyledTable>{children}</StyledTable>
    </StyledRoot>
  );
}

function TableCell({ isHeader, children }) {
  if (isHeader) {
    return <StyledTableHeadCell>{children}</StyledTableHeadCell>;
  }

  return <StyledTableBodyCell>{children}</StyledTableBodyCell>;
}

function TableBody({ children }) {
  return <StyledTableBody>{children}</StyledTableBody>;
}

function TableRow({ children }) {
  return <StyledTableBodyRow>{children}</StyledTableBodyRow>;
}

function CodeBlock({ language, value }) {
  return <SyntaxHighlighter language={language}>{value}</SyntaxHighlighter>;
}

const renderers = {
  heading: Heading,
  paragraph: Paragraph2,
  link: StyledLink,
  blockquote: Blockquote,
  table: Table,
  tableBody: TableBody,
  tableRow: TableRow,
  tableCell: TableCell,
  code: CodeBlock,
};

export default function (props) {
  const { source, ...rest } = props;

  return (
    <Block font="font300">
      <ReactMarkdown
        source={source}
        escapeHtml={false}
        renderers={renderers}
        {...rest}
      />
    </Block>
  );
}

export function SmallMarkdown(props) {
  const { source, ...rest } = props;

  return (
    <Block font="font200">
      <ReactMarkdown
        source={source}
        escapeHtml={false}
        renderers={{
          paragraph: Paragraph3,
        }}
        {...rest}
      />
    </Block>
  );
}
