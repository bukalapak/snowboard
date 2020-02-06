import speakingUrl from "speakingurl";

export function toSlug(str, separator = "~") {
  return speakingUrl(str, {
    separator,
    custom: { _: separator }
  });
}
