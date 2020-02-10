import React from "react";
import { Block } from "baseui/block";
import Markdown from "../components/Markdown";
import Breadcrumb from "../components/Breadcrumb";
import { H3 } from "baseui/typography";

export default ({ group }) => {
  return (
    <>
      <Block marginTop="scale800">
        <Breadcrumb group={group} />
      </Block>

      <H3>{group.title}</H3>
      <Markdown source={group.description} />
    </>
  );
};
