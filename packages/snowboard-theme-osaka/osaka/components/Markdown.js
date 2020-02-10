import React from "react";
import ReactMarkdown from "react-markdown";
import speakingUrl from "speakingurl";
import { Block } from "baseui/block";
import { H1, H2, H3, H4, H5, H6 } from "baseui/typography";
import { Paragraph2 } from "baseui/typography";
import { StyledLink } from "baseui/link";
import { Notification, KIND } from "baseui/notification";

function Heading(props) {
  const attrs = {
    id: speakingUrl(props.children[0].props.value),
    ...props
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
        Body: { style: { width: "auto" } }
      }}
      kind={KIND.warning}
    >
      {children}
    </Notification>
  );
}

const renderers = {
  heading: Heading,
  paragraph: Paragraph2,
  link: StyledLink,
  blockquote: Blockquote
};

export default function(props) {
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
