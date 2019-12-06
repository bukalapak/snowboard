import { readFileSync } from "fs";
import nodeHttp from "http";
import nodeHttps from "https";

function httpsCreateServer(app, cert, key) {
  return nodeHttps.createServer(
    {
      key: readFileSync(cmd.key),
      cert: readFileSync(cmd.cert)
    },
    app
  );
}

function parseBinding(str) {
  const [hostStr, portStr] = str.split(":");
  const port = parseInt(portStr, 10);
  const host = hostStr === "" ? undefined : hostStr;

  return [host, port];
}

export function httpBind(cmd, { bind }) {
  const selected = cmd.bind ? cmd.bind : bind;
  return parseBinding(selected);
}

export function httpServer(app, cmd) {
  let server;

  if (cmd.ssl && cmd.cert && cmd.key) {
    server = httpsCreateServer(app, cmd.cert, cmd.key);
  } else {
    server = nodeHttp.createServer(app);
  }

  return server;
}

export function checkSSL({ ssl, cert, key }) {
  if (ssl && !(cert && key)) {
    throw new Error(
      "HTTPS requires ssl cert and key file. Pass it using `-C` and `-K` flag."
    );
  }
}
