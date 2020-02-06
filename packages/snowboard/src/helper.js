import { readFileSync } from "fs";
import { resolve } from "path";
import nodeHttp from "http";
import nodeHttps from "https";
import { read } from "snowboard-reader";
import { parse, fromRefract } from "snowboard-parser";

const templatePrefix = "snowboard-theme-";

export function detectTemplate(template) {
  try {
    const selected = require(`${templatePrefix}${template}`);
    return selected.entrypoint;
  } catch {
    return resolve(process.cwd(), template);
  }
}

export function parseBinding(str) {
  const [hostStr, portStr] = str.split(":");
  const port = parseInt(portStr, 10);
  const host = hostStr === "" ? undefined : hostStr;

  return [host, port];
}

export function httpServer(app) {
  return nodeHttp.createServer(app);
}

export function httpsServer(app, cert, key) {
  return nodeHttps.createServer(
    {
      key: readFileSync(key),
      cert: readFileSync(cert)
    },
    app
  );
}

async function readAsRefract(input) {
  return parse(await read(input));
}

export async function readAsElement(input) {
  return fromRefract(await readAsRefract(input));
}

export async function readMultiAsElement(inputs) {
  return Promise.all(inputs.map(v => readAsElement(v)));
}
