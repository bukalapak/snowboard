import React from "react";
import ReactMarkdown from "react-markdown";
import { Heading as BaseHeading } from "@chakra-ui/core";
import { Box } from "@chakra-ui/core";
import { Text } from "@chakra-ui/core";
import { Callout } from "@chakra-ui/core";
import { Code } from "@chakra-ui/core";
import getSlug from "speakingurl";
import { List as BaseList, ListItem as BaseListItem } from "@chakra-ui/core";

function Heading(props) {
  const sizes = ["xl", "lg", "md", "sm", "xs", "2xs"];
  const size = sizes[props.level - 1];
  const slug = getSlug(props.children[0].props.value);

  return (
    <BaseHeading
      as={`h${props.level}`}
      size={size}
      id={`#${slug}`}
      mt="4"
      mb="2"
      {...props}
    />
  );
}

function Paragraph(props) {
  return <Text as="p" lineHeight="tall" display="contents" {...props} />;
}

function Table(props) {
  return <Box as="table" my="4" {...props} />;
}

function TableCell(props) {
  return (
    <Box as={props.isHeader ? "th" : "td"} borderWidth="1px" px="2">
      {props.children}
    </Box>
  );
}

function Pre(props) {
  return (
    <Box my="4" rounded="sm" bg="gray.800" p="2">
      <Code bg="gray.800" color="white" whiteSpace="pre-wrap">
        {props.value}
      </Code>
    </Box>
  );
}

function List(props) {
  return (
    <BaseList
      styleType={props.ordered ? "decimal" : "disc"}
      as={props.ordered ? "ol" : "ul"}
      {...props}
    />
  );
}

function ListItem(props) {
  return <BaseListItem {...props} />;
}

function Blockquote(props) {
  return (
    <Callout
      mt={4}
      variant="left-accent"
      status="warning"
      css={{ "> *:first-of-type": { marginTop: 0 } }}
      {...props}
    />
  );
}

const renderers = {
  heading: Heading,
  paragraph: Paragraph,
  table: Table,
  tableCell: TableCell,
  code: Pre,
  inlineCode: Code,
  list: List,
  listItem: ListItem,
  blockquote: Blockquote
};

export default function(props) {
  const { source, ...rest } = props;

  return (
    <ReactMarkdown
      source={source}
      escapeHtml={false}
      renderers={renderers}
      {...rest}
    />
  );
}
