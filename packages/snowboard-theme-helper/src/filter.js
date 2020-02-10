export function filter(query, groups) {
  if (query === "") {
    return [];
  }

  const items = [];
  const regex = new RegExp(escape(query), "gi");

  groups.forEach(group => {
    if (group.title.match(regex)) {
      items.push({
        title: group.title,
        kind: "group",
        permalink: group.permalink
      });
    }

    group.resources.forEach(resource => {
      if (resource.title.match(regex)) {
        items.push({
          title: resource.title,
          kind: "resource",
          permalink: resource.permalink
        });
      }

      resource.transitions.forEach(transition => {
        if (
          transition.title.match(regex) ||
          transition.method.match(regex) ||
          transition.path.match(regex)
        ) {
          items.push({
            title: transition.title,
            method: transition.method,
            permalink: transition.permalink,
            kind: "transition"
          });
        }
      });
    });
  });

  return items;
}

function escape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
