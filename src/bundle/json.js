import { join as pathJoin } from "path";
import { writeFile, jsonStringify } from "../utils";
import { transitions as transitionsParser } from "../parser/html";

export default async function(element, uuidMap, jsonDir, { optimized }) {
  const transitions = transitionsParser(element);

  await Promise.all(
    transitions.map(async transition => {
      await writeFile(
        pathJoin(jsonDir, `${uuidMap[transition.permalink]}.json`),
        jsonStringify(transition, optimized),
        "utf8"
      );
    })
  );
}
