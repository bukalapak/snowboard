export function findGroup(permalink, groups) {
  return groups.find((group) => {
    return group.permalink == permalink;
  });
}

export function findResource(permalink, resources, groups) {
  let selected;
  let selectedGroup;

  groups.forEach((group) => {
    group.resources.forEach((resource) => {
      if (resource.permalink === permalink) {
        selected = resource;
        selectedGroup = group;
      }
    });
  });

  if (selected) {
    return { resource: selected, group: selectedGroup };
  }

  resources.forEach((resource) => {
    if (resource.permalink === permalink) {
      selected = resource;
    }
  });

  return { resource: selected };
}
