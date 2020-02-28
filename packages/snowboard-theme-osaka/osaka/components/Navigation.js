import React, { useState, useEffect } from "react";
import { useNavigation } from "react-navi";
import memoizeOne from "memoize-one";
import { Block } from "baseui/block";
import { Navigation } from "baseui/side-navigation";
import { useCurrentRoute } from "react-navi";
import { toHref, toPermalink } from "../lib/helper";
import { toNavigation, filterNavigation } from "snowboard-theme-helper";

const toNavigationMemo = memoizeOne(toNavigation);

export default function({ title, groups, resources, descriptionToc }) {
  const items = toNavigationMemo({
    title,
    groups,
    resources,
    toc: descriptionToc
  });
  return <FilteredNavigation items={items} />;
}

function mapItem(item) {
  return {
    title: item.title,
    itemId: toHref(item.permalink),
    subNav: item.children.map(subitem => mapItem(subitem))
  };
}

function FilteredNavigation({ items }) {
  const route = useCurrentRoute();
  const navigation = useNavigation();
  const filteredItems = filterNavigation(
    toPermalink(route.url.pathname),
    items
  );

  return (
    <Block width="100%">
      <Navigation
        items={filteredItems}
        activeItemId={route.url.pathname}
        onChange={({ event, item }) => {
          event.preventDefault();
          navigation.navigate(item.itemId);
        }}
        mapItem={item => mapItem(item)}
        overrides={{
          NavItem: {
            style: ({ $active, $theme }) => {
              return {
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis"
              };
            }
          }
        }}
      />
    </Block>
  );
}
