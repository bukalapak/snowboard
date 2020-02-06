import { toParameters, toHeader } from "./transform";

export function digParameters(path, resource, transition) {
  const items = [];

  toParameters(resource, path).forEach(params => items.push(params));
  toParameters(transition, path).forEach(params => items.push(params));

  return items;
}

export function digHeaders(headers) {
  return (headers || []).map(header => toHeader(header));
}
