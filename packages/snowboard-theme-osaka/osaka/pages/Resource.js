import React from "react";
import { Block } from "baseui/block";
import { H3 } from "baseui/typography";
import Markdown from "../components/Markdown";
import Breadcrumb from "../components/Breadcrumb";
import { TransitionList } from "../components/List";

export default ({ resource, group }) => {
  return (
    <>
      <Block marginTop="scale800">
        <Breadcrumb group={group} resource={resource} />
      </Block>
      <H3>{resource.title}</H3>
      <Markdown source={resource.description} />
      <TransitionList resource={resource} />
    </>
  );
};
