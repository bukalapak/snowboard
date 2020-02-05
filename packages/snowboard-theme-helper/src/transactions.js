import XXH from "xxhashjs";
import stableStringify from "fast-json-stable-stringify";

export function toTransactions(transactions) {
  const items = {};

  transactions.forEach(transaction => {
    const { request, response } = transaction;
    const requestHash = XXH.h32(stableStringify(request), 0xabcde).toString(16);

    if (!Object.keys(items).includes(requestHash)) {
      items[requestHash] = {
        request,
        responses: [response]
      };
    } else {
      items[requestHash].responses.push(response);
    }
  });

  return Object.values(items);
}
