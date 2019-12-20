import React from "react";
import { Link as NavLink } from "react-navi";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/core";

import { toGroupHref, toResourceHref, toTransitionHref } from "../lib/util";

export default ({ group, resource, transition }) => {
  const items = [
    <BreadcrumbItem key="/">
      <BreadcrumbLink as={NavLink} href="/">
        API
      </BreadcrumbLink>
    </BreadcrumbItem>
  ];

  if (group) {
    items.push(
      <BreadcrumbItem isCurrentPage={!resource} key={group.permalink}>
        <BreadcrumbLink as={NavLink} href={toGroupHref(group.permalink)}>
          {group.title}
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  }

  if (resource) {
    items.push(
      <BreadcrumbItem isCurrentPage={!transition} key={resource.permalink}>
        <BreadcrumbLink as={NavLink} href={toResourceHref(resource.permalink)}>
          {resource.title}
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  }

  if (transition) {
    items.push(
      <BreadcrumbItem isCurrentPage key={transition.permalink}>
        <BreadcrumbLink
          as={NavLink}
          href={toTransitionHref(transition.permalink)}
        >
          {transition.title}
        </BreadcrumbLink>
      </BreadcrumbItem>
    );
  }

  return <Breadcrumb>{items}</Breadcrumb>;
};
