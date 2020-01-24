import React, { useState, useEffect } from "react";
import { pick } from "lodash";
import { useNavigation } from "react-navi";
import memoizeOne from "memoize-one";
import { Block } from "baseui/block";
import { Navigation } from "baseui/side-navigation";
import { useCurrentRoute } from "react-navi";
import { toGroupHref, toResourceHref, toTransitionHref } from "../lib/util";

function groupItems(title, groups) {
  const items = groups.map(group => {
    return {
      title: group.title,
      itemId: toGroupHref(group.permalink),
      subNav: group.resources.map(resource => {
        return {
          title: resource.title,
          itemId: toResourceHref(resource.permalink),
          subNav: resource.transitions.map(transition => {
            return {
              title: transition.title,
              itemId: toTransitionHref(transition.permalink)
            };
          })
        };
      })
    };
  });

  items.unshift({
    title: title,
    itemId: "/",
    subNav: []
  });

  return items;
}

function pickItemFields(item) {
  return pick(item, ["title", "itemId"]);
}

function pickItemChildren(item) {
  return item.subNav.map(subitem => pickItem(subitem));
}

function pickItem(item, withChildren) {
  if (withChildren) {
    return { ...pickItem(item), subNav: pickItemChildren(item) };
  }

  return pickItemFields(item);
}

function filterItems(url, items) {
  if (url === "/") {
    return items.map(item => pickItemFields(item));
  }

  const data = [];

  items.forEach(item => {
    const currentResourceTransition = item.subNav.find(subitem =>
      subitem.subNav.find(child => child.itemId === url)
    );
    const currentResource = item.subNav.find(subitem => subitem.itemId === url);

    if (currentResourceTransition) {
      data.push({
        ...pickItem(item),
        subNav: item.subNav.map(subitem => {
          const ct = subitem.subNav.find(c => c.itemId === url);
          return pickItem(subitem, ct);
        })
      });
    } else {
      if (currentResource) {
        data.push({
          ...pickItem(item),
          subNav: item.subNav.map(subitem => {
            return pickItem(subitem, subitem.itemId === url);
          })
        });
      } else {
        data.push(pickItem(item, item.itemId === url));
      }
    }
  });

  return data;
}

const memoizeGroupItems = memoizeOne(groupItems);

export default function({ title, groups }) {
  const items = memoizeGroupItems(title, groups);

  return <FilteredNavigation items={items} />;
}

function FilteredNavigation({ items }) {
  const route = useCurrentRoute();
  const filteredItems = filterItems(route.url.pathname, items);
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
          setLocation(item.itemId);
        }}
      />
    </Block>
  );
}
