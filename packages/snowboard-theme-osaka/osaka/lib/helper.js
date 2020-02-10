import { filter as filterHelper } from 'snowboard-theme-helper';

export function toHref(permalink) {
  const char = permalink.substr(0, 1);
  return permalink.replace(`${char}~`, `/${char}/`);
}

export function toPermalink(pathname) {
  const char = pathname.substr(1, 1);
  return pathname.replace(`/${char}/`, `${char}~`);
}

export function filter(query, groups) {
  return filterHelper(query, groups).map(item => {
    const { permalink, ...rest} = item;

    return {
      ...rest,
      href: toHref(permalink)
    }
  });
}