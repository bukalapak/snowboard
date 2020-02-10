import React from "react";
import Markdown from "../components/Markdown";
import { Block } from "baseui/block";

export default function Home({ description }) {
  return (
    <Block marginRight="scale800">
      <Markdown source={description} />
    </Block>
  );
}
