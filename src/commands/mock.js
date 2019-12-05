import express from "express";
import morgan from "morgan";
import cors from "cors";
import expressBasicAuth from "express-basic-auth";
import { loadRead } from "../internal/util";
import { router as mockRouter } from "../internal/mock";
import loadConfig from "../internal/config";

async function mockCmd(inputs, cmd) {
  const config = await loadConfig(cmd.config);
  const items = await Promise.all(inputs.map(val => loadRead(val)));

  const app = express();

  app.use(morgan("dev"));
  app.use(cors());

  if (config.mock) {
    switch (config.mock.auth.name) {
      case "basic":
        const { username, password } = config.mock.auth.options;
        app.use(basicAuth({ username, password }));
        break;
      case "apikey":
        app.use(
          apiKeyAuth({
            apiKey: config.mock.auth.options.key,
            headerName: config.mock.auth.options.header
          })
        );
    }
  }

  app.use(mockRouter(items));
  app.use((req, res) => res.sendStatus(404));

  return app;
}

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

export default mockCmd;
