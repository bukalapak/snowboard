const fs = require("fs");
const http = require("http");
const tmp = require("tmp");
const util = require("util");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const chokidar = require("chokidar");
const parseDuration = require("parse-duration");
const { flattenDeep } = require("lodash");

const basicAuth = require("express-basic-auth");

const { readChildren } = require("./internal/input");
const { router } = require("./mock");
const { load: loadConfig } = require("./internal/config");
const { htmlBundle: renderHtmlBundle } = require("./internal/bundle");
const { lint: renderLint, list: renderList } = require("./internal/render");
const { read, load, lint } = require("./snowboard");

const tmpDirAsync = util.promisify(tmp.dir);

function writeOutput(output, data) {
  if (output) {
    fs.writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

async function apibCmd(input, cmd) {
  const source = read(input);

  writeOutput(cmd.output, source);

  if (!cmd.quiet && cmd.output) {
    console.log("%s: API blueprint has been generated", cmd.output);
  }
}

async function jsonCmd(input, cmd) {
  const result = await load(input);
  const data = JSON.stringify(result, null, 2);

  writeOutput(cmd.output, data);

  if (!cmd.quiet && cmd.output) {
    console.log("%s: API elements JSON has been generated", cmd.output);
  }
}

async function lintCmd(input, cmd) {
  const result = await lint(input);

  if (result.length === 0) {
    if (!cmd.quiet) {
      console.log("OK");
    }
  } else {
    if (!cmd.quiet) {
      renderLint(result);
    }

    return 1;
  }
}

async function listCmd(inputs) {
  const items = await Promise.all(inputs.map(val => load(val)));
  items.forEach(item => renderList(item));
}

async function htmlCmd(input, cmd) {
  const data = await htmlBundle(input, cmd);

  if (!cmd.quiet && cmd.output) {
    console.log(`HTML output is ready: ${cmd.output}`);
  } else {
    console.log(data);
  }
}

function parseBinding(str) {
  const [hostStr, portStr] = str.split(":");
  const port = parseInt(portStr, 10);
  const host = hostStr === "" ? undefined : hostStr;

  return [host, port];
}

async function htmlBundle(input, cmd) {
  const result = await load(input);
  return await renderHtmlBundle(result, cmd);
}

function httpServer(app, cmd, options) {
  const server = http.createServer(app);
  const bind = cmd.bind ? cmd.bind : options.bind;
  const [host, port] = parseBinding(bind);

  server.on("listening", () => {
    console.log("-".repeat(64));
    console.log(`${options.title} is ready. Use ${bind}`);
    console.log("-".repeat(64));
  });

  return server.listen(port, host);
}

async function httpCmd(input, cmd) {
  cmd.output = await tmpDirAsync();

  const output = await htmlBundle(input, cmd);
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static(output));

  return httpServer(app, cmd, { title: "HTTP server", bind: ":8088" });
}

async function mockCmd(inputs, cmd) {
  const app = express();
  const items = await Promise.all(inputs.map(val => load(val)));
  const config = await loadConfig(cmd.config);

  app.use(morgan("dev"));
  app.use(cors());

  if (config.mock) {
    switch (config.mock.auth.name) {
      case "basic":
        const { username, password } = config.mock.auth.options;

        app.use(
          basicAuth({
            users: { [username]: password }
          })
        );
        break;
      case "apikey":
        app.use((req, res, next) => {
          const apiKey = req.get(config.mock.auth.options.header);

          if (!apiKey || apiKey != config.mock.auth.options.key) {
            res.sendStatus(401);
          } else {
            next();
          }
        });
    }
  }

  app.use(router(items));
  app.use((req, res) => res.sendStatus(404));

  return httpServer(app, cmd, { title: "Mock server", bind: ":8087" });
}

function watchBuilder(input, options) {
  const opts = {
    persistent: true
  };

  if (options.watchInterval) {
    opts.usePolling = true;
    opts.interval = parseDuration(options.watchInterval);
  }

  let files;

  if (Array.isArray(input)) {
    files = flattenDeep(Array.from(input).map(input => readChildren(input)));
  } else {
    files = readChildren(input);
  }

  return chokidar.watch(files, opts);
}

async function watchCmd(input, cmd, options, fn) {
  fn(input, cmd);

  if (options.watch) {
    const watcher = watchBuilder(input, options);
    watcher.on("change", () => fn(input, cmd));
  }
}

module.exports = {
  apib: apibCmd,
  json: jsonCmd,
  lint: lintCmd,
  list: listCmd,
  html: htmlCmd,
  http: httpCmd,
  mock: mockCmd,
  watch: watchCmd,

  htmlBundle,
  watchBuilder
};
