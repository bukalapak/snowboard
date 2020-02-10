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
  const items = toNavigationMemo({ title, groups, resources, descriptionToc });
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
  const filteredItems = filterNavigation(
    toPermalink(route.url.pathname),
    items
  );
  const [location, setLocation] = useState(route.url.pathname);
  const navigation = useNavigation();

  useEffect(() => {
    setLocation(route.url.pathname);
  }, [route]);

  return (
    <Block width="100%">
      <Navigation
        items={filteredItems}
        activeItemId={location}
        onChange={({ event, item }) => {
          event.preventDefault();
          navigation.navigate(item.itemId);
          setLocation(toHref(item.itemId));
        }}
        mapItem={item => {
          const m = mapItem(item);
          return m;
        }}
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
