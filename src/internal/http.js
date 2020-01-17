import { readFileSync } from "fs";
import nodeHttp from "http";
import nodeHttps from "https";

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
