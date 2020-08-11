import React from "react";
import { Block } from "baseui/block";
import { H3 } from "baseui/typography";
import { Accordion, Panel } from "baseui/accordion";
import Markdown from "../components/Markdown";
import Breadcrumb from "../components/Breadcrumb";
import { TransitionList } from "../components/List";

export default ({ group }) => {
  return (
    <>
      <Block marginTop="scale800">
        <Breadcrumb group={group} />
      </Block>

      <H3>{group.title}</H3>
      <Markdown source={group.description} />
      <Accordion>
        {group.resources.map((resource) => (
          <Panel title={resource.title} key={resource.permalink}>
            <TransitionList resource={resource} />
          </Panel>
        ))}
      </Accordion>
    </>
  );
};
