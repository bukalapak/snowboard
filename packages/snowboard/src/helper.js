import { readFileSync } from "fs";
import { resolve } from "path";
import nodeHttp from "http";
import nodeHttps from "https";
import { read } from "snowboard-reader";
import { parse, fromRefract } from "snowboard-parser";

const templatePrefix = "snowboard-theme-";
const defaultTemplate = "winter";
const defaultOutput = resolve(process.cwd(), "./dist");

export function detectTemplate(template) {
  if (!template) {
    template = defaultTemplate;
  }

  try {
    const selected = require(`${templatePrefix}${template}`);
    return selected.entrypoint;
  } catch {
    return resolve(process.cwd(), template);
  }
}

export function detectOutput(output) {
  if (output) {
    return resolve(process.cwd(), output);
  }

  return defaultOutput;
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

export async function load(input) {
  const source = await read(input);
  const result = await parse(source);

  return fromRefract(result);
}

export async function loadMulti(inputs) {
  return Promise.all(inputs.map(v => load(v)));
}
