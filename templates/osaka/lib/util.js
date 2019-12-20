export function toHref(permalink, char) {
  return permalink.replace(`${char}~`, `/${char}/`);
}

export function toGroupHref(permalink) {
  return toHref(permalink, "g");
}

export function toResourceHref(permalink) {
  return toHref(permalink, "r");
}

export function toTransitionHref(permalink) {
  return toHref(permalink, "t");
}
