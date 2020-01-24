import React from "react";
import { Breadcrumbs } from "baseui/breadcrumbs";
import { toGroupHref, toResourceHref, toTransitionHref } from "../lib/util";
import Link from "../components/Link";

export default ({ group, resource, transition }) => {
  const items = [];

  if (group) {
    items.push(
      <Link key={group.permalink} href={toGroupHref(group.permalink)}>
        {group.title}
      </Link>
    );
  }

  if (resource) {
    items.push(
      <Link key={resource.permalink} href={toResourceHref(resource.permalink)}>
        {resource.title}
      </Link>
    );
  }

  if (transition) {
    items.push(
      <Link
        key={transition.permalink}
        href={toTransitionHref(transition.permalink)}
      >
        {transition.title}
      </Link>
    );
  }

  return <Breadcrumbs>{items}</Breadcrumbs>;
};
