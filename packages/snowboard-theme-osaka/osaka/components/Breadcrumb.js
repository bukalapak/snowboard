import React from "react";
import { Breadcrumbs } from "baseui/breadcrumbs";
import { toHref } from "../lib/helper";
import Link from "./Link";

export default ({ group, resource, transition }) => {
  const items = [];

  if (group) {
    items.push(
      <Link key={group.permalink} href={toHref(group.permalink)}>
        {group.title}
      </Link>
    );
  }

  if (resource) {
    items.push(
      <Link key={resource.permalink} href={toHref(resource.permalink)}>
        {resource.title}
      </Link>
    );
  }

  if (transition) {
    items.push(
      <Link key={transition.permalink} href={toHref(transition.permalink)}>
        {transition.title}
      </Link>
    );
  }

  return <Breadcrumbs>{items}</Breadcrumbs>;
};
