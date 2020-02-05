import { Command, flags } from "@oclif/command";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import expressBasicAuth from "express-basic-auth";
import chalk from "chalk";
import { merge } from "lodash";
import { borderlessTable, spinner } from "snowboard-helper";
import mockRouter from "snowboard-mock-router";
import loadConfig from "../config";
import { parseBinding, httpServer, httpsServer } from "../helper";
import { readMultiAsElement } from "../helper";

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

    const items = await spinner(readMultiAsElement(argv), "Parsing input(s)", {
      sucess: "Input(s) parsed",
      quiet: flags.quiet
    });

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

    const router = mockRouter(items);

    app.use(router);
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

    if (!flags.quiet) {
      const routes = router.stack
        .filter(r => r.route)
        .map(r => {
          return [
            Object.keys(r.route.methods)
              .join(",")
              .toUpperCase(),
            r.route.path
          ];
        })
        .sort((a, b) => a[1].localeCompare(b[1]));

      routes.unshift([, ,]);
      this.log(borderlessTable(routes));

      server.once("listening", () => {
        const scheme = flags.ssl ? "https" : "http";
        const hostport = chalk.green(
          `${scheme}://${host || "localhost"}:${port}`
        );

        this.log(`Mock server running at ${hostport}`);
      });
    }
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
