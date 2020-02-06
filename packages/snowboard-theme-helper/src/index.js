import speakingUrl from "speakingurl";
import jsonParseSafe from "json-parse-safe";
import clipboardCopyOriginal from "clipboard-copy";

export { toNavigation, filterNavigation } from "./navigation";
export { toTransactions } from "./transactions";
export { exchangeToken, exchangeTokenWithPKCE, sendRequest } from "./oauth2";

export {
  getPKCE,
  getState,
  clearPKCE,
  clearState,
  setEnv,
  getEnv,
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken
} from "./store";

export const jsonParse = jsonParseSafe;
export const clipboardCopy = clipboardCopyOriginal;

export function toSlug(str, separator = "~") {
  return speakingUrl(str, {
    separator,
    custom: { _: separator }
  });
}
