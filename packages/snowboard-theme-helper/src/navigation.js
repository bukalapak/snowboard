import { pick } from "lodash";
import { toSlug } from "./slug";

export function toNavigation({
  groups,
  resources,
  title = "API",
  toc = [],
  basePath = "/"
}) {
  let items = groups.map(group => {
    return {
      title: group.title,
      permalink: group.permalink,
      children: resourcesMap(group.resources)
    };
  });

  items = items.concat(resourcesMap(resources));

  items.unshift({
    title: title,
    permalink: basePath,
    isToc: true,
    children: tocMap(toc, basePath)
  });

  return items;
}

function resourcesMap(resources) {
  return resources.map(resource => {
    return {
      title: resource.title,
      permalink: resource.permalink,
      children: resource.transitions.map(transition => {
        return {
          title: transition.title,
          permalink: transition.permalink,
          children: []
        };
      })
    };
  });
}

function tocMap(toc, basePath = "/") {
  const data = [];

  toc.forEach(item => {
    if (item.depth === 2) {
      data.push({
        title: item.text,
        isToc: true,
        permalink: `${basePath}#` + toSlug(item.text, "-"),
        children: []
      });
    }

    if (item.depth === 3) {
      data[data.length - 1].children.push({
        title: item.text,
        isToc: true,
        permalink: `${basePath}#` + toSlug(item.text, "-"),
        children: []
      });
    }
  });

  return data;
}

export function filterNavigation(current, items) {
  if (current === items[0].permalink) {
    return items.map(item => {
      if (item.permalink === current) {
        return item;
      } else {
        return pickItemFields(item);
      }
    });
  }

  const data = [];

  items.forEach(item => {
    const currentResourceTransition = item.children.find(child => {
      return findByChildren(current, child);
    });

    const currentResource = findByChildren(current, item);

    if (currentResourceTransition) {
      data.push({
        ...pickItem(item),
        children: item.children.map(child => {
          const selected = findByChildren(current, child);
          return pickItem(child, selected);
        })
      });
    } else {
      if (currentResource) {
        data.push({
          ...pickItem(item),
          children: item.children.map(child => {
            return pickItem(child, child.permalink === current);
          })
        });
      } else {
        data.push(pickItem(item, item.permalink === current));
      }
    }
  });

  return data;
}

function pickItemFields(item) {
  return { ...pick(item, ["title", "permalink"]), children: [] };
}

function pickItemChildren(item) {
  return item.children.map(child => pickItem(child));
}

function pickItem(item, withChildren) {
  if (withChildren) {
    return { ...pickItem(item), children: pickItemChildren(item) };
  }

  return pickItemFields(item);
}

function findByChildren(current, item) {
  return item.children.find(child => child.permalink === current);
}
