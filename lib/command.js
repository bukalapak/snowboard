const fs = require("fs");
const http = require("http");
const https = require("https");
const tmp = require("tmp");
const util = require("util");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const chokidar = require("chokidar");
const parseDuration = require("parse-duration");
const ora = require("ora");
const { flatten, flattenDeep } = require("lodash");
const { table, getBorderCharacters } = require("table");

const basicAuth = require("express-basic-auth");

const { readChildren } = require("./internal/input");
const { router } = require("./mock");
const { load: loadConfig } = require("./internal/config");
const { htmlBundle: renderHtmlBundle } = require("./internal/bundle");
const { read, load, lint } = require("./snowboard");

const tmpDirAsync = util.promisify(tmp.dir);

const tableConfig = {
  border: getBorderCharacters("ramac")
};

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

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  if (cmd.simple) {
    writeOutput(cmd.output, JSON.stringify(result, null, 2));

    if (!cmd.quiet && cmd.output) {
      console.log("%s: API definitions JSON has been generated", cmd.output);
    }
  } else {
    writeOutput(cmd.output, JSON.stringify(result.data, null, 2));

    if (!cmd.quiet && cmd.output) {
      console.log("%s: API elements JSON has been generated", cmd.output);
    }
  }
}

function lintMap(result) {
  return result.map(item => {
    return {
      location: item.location.map(
        loc => `line ${loc.line}, column ${loc.column}`
      ),
      severity: item.severity,
      description: item.description
    };
  });
}

async function lintCmd(input, cmd) {
  const result = await lint(input);

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  if (result.length === 0) {
    if (!cmd.quiet) {
      console.log("OK");
    }
  } else {
    if (!cmd.quiet) {
      const mapResult = lintMap(result);

      if (cmd.json) {
        console.log(JSON.stringify(mapResult, null, "  "));
      } else {
        const data = mapResult.map(item => {
          return [item.location.join(" - "), item.severity, item.description];
        });

        data.unshift(["Location", "Severity", "Description"]);
        console.log(table(data, tableConfig));
      }
    }

    return 1;
  }
}

function listMap(result) {
  const data = [];

  result.actions.forEach(action => {
    action.transactions.forEach(transaction => {
      data.push({
        method: action.method.toUpperCase(),
        statusCode: transaction.response.statusCode,
        path: action.path
      });
    });
  });

  return data;
}

async function listCmd(inputs, cmd) {
  const items = await Promise.all(inputs.map(val => load(val)));
  const listed = flatten(items.map(item => listMap(item)));

  if (cmd.json) {
    console.log(JSON.stringify(listed, null, "  "));
    return;
  }

  listed.forEach(item => {
    console.log([item.method, item.statusCode, item.path].join("\t"));
  });
}

async function htmlCmd(input, cmd) {
  if (cmd.output) {
    if (cmd.quiet) {
      await htmlBundle(input, cmd);
    } else {
      await htmlBundleSpinner(input, cmd);
    }
  } else {
    const data = await htmlBundle(input, cmd);
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

  if (!result) {
    throw new Error(`ERROR: unable to parse input: ${input}`);
  }

  return await renderHtmlBundle(result, cmd);
}

async function htmlBundleSpinner(input, cmd) {
  const spinner = new ora({ text: `Processing input: ${input}` });
  spinner.start();

  try {
    return await load(input)
      .then(result => {
        if (!result) {
          throw new Error(`ERROR: unable to parse input: ${input}`);
        }

        spinner.text = "Rendering HTML documentation";
        spinner.color = "yellow";
        return renderHtmlBundle(result, cmd);
      })
      .then(output => {
        spinner.text = `HTML output is ready: ${output}`;
        spinner.succeed();
        return output;
      });
  } catch (err) {
    let errStr;

    if ("UriTemplateError" === err.constructor.name) {
      errStr = `${err.options.message} ${err.options.templateText}`;
    } else {
      errStr = err.toString();
    }

    spinner.fail();
    throw new Error(errStr);
  }
}

function httpServer(app, cmd, options) {
  let server;

  if (cmd.ssl && cmd.cert && cmd.key) {
    server = https.createServer(
      {
        key: fs.readFileSync(cmd.key),
        cert: fs.readFileSync(cmd.cert)
      },
      app
    );
  } else {
    server = http.createServer(app);
  }

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

  const output = await htmlBundleSpinner(input, cmd);
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static(output));

  const title = cmd.ssl ? "HTTPS" : "HTTP";

  return httpServer(app, cmd, { title: `${title} server`, bind: ":8088" });
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
        // eslint-disable-next-line no-case-declarations
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
  htmlBundleSpinner,
  watchBuilder
};
