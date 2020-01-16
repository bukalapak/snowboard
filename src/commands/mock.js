import { Command, flags } from "@oclif/command";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import expressBasicAuth from "express-basic-auth";
import chalk from "chalk";
import { merge } from "lodash";
import loadConfig from "../internal/config";
import { readMultiAsElement } from "../util";
import { router as mockRouter } from "../internal/mock";
import { parseBinding, httpServer, httpsServer } from "../internal/http";

function basicAuth({ username, password }) {
  return expressBasicAuth({
    users: { [username]: password }
  });
}

function apiKeyAuth({ apiKey, headerName }) {
  return (req, res, next) => {
    const reqKey = req.get(headerName);

    if (!reqKey || reqKey != apiKey) {
      res.sendStatus(401);
    } else {
      next();
    }
  };
}

const defaultConfig = {
  auth: { name: "none", options: {} }
};

class MockCommand extends Command {
  static strict = false;
  static usage = "mock INPUT [INPUTS...]";
  static args = [{ name: "input", required: true }];

  async run() {
    const { flags, argv } = this.parse(MockCommand);
    const { mock: mockConfig } = await loadConfig();

    const config = merge(defaultConfig, mockConfig);
    const items = await readMultiAsElement(argv);
    const app = express();

    app.use(morgan("dev"));
    app.use(cors());

    if (config) {
      switch (config.auth.name) {
        case "basic":
          const { username, password } = config.auth.options;
          app.use(basicAuth({ username, password }));
          break;
        case "apikey":
          app.use(
            apiKeyAuth({
              apiKey: config.auth.options.key,
              headerName: config.auth.options.header
            })
          );
      }
    }

    app.use(mockRouter(items));
    app.use((req, res) => res.sendStatus(404));

    let server;

    if (flags.ssl) {
      server = httpsServer(app, flags.cert, flags.key);
    } else {
      server = httpServer(app);
    }

    const [host, port] = parseBinding(flags.bind);

    server.listen(port, host);

    server.on("error", err => {
      this.error(err);
    });

    server.once("listening", () => {
      const scheme = flags.ssl ? "https" : "http";
      const hostport = chalk.green(
        `${scheme}://${host || "localhost"}:${port}`
      );
      this.log(`Mock server running at ${hostport}`);
    });
  }
}

MockCommand.description = `run mock server`;

MockCommand.flags = {
  ssl: flags.boolean({
    char: "S",
    description: "enable https",
    dependsOn: ["cert", "key"]
  }),
  cert: flags.string({ char: "C", description: "SSL cert file" }),
  key: flags.string({ char: "K", description: "SSL key file" }),
  bind: flags.string({
    char: "b",
    description: "listen address",
    default: ":8087"
  }),
  quiet: flags.boolean({ char: "q", description: "quiet mode" })
};

export default MockCommand;
