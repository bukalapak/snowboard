#!/usr/bin/env node

const fs = require("fs");
const commander = require("commander");
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const preferHeader = require("parse-prefer-header");
const chokidar = require("chokidar");
const parseDuration = require("parse-duration");
const { resolve } = require("path");
const { flattenDepth, find } = require("lodash");

const {
  read,
  load,
  lint,
  json,
  renderLint,
  renderList,
  renderHtmlSingle,
  renderHtmlMulti
} = require("./snowboard");

const { readChildren } = require("./internal/input");

const { version } = JSON.parse(
  fs.readFileSync(resolve(__dirname, "..", "package.json"), "utf8")
);

function unknownCommand() {
  console.error("Unknown command");
  process.exit(1);
}

function writeOutput(output, data) {
  if (output) {
    fs.writeFileSync(output, data);
  } else {
    process.stdout.write(data);
  }
}

async function watchCmd(input, cmd, fn) {
  if (cmd.watch) {
    const options = {
      persistent: true,
    }

    if (cmd.watchInterval) {
      options.usePolling = true;
      options.interval = parseDuration(cmd.watchInterval);
    }

    const files = readChildren(input);
    const watcher = chokidar.watch(files, options);

    watcher.on('change', () => fn(input, cmd));
  } else {
    fn(input, cmd);
  }
}

function apibCmd(input, cmd) {
  try {
    const source = read(input);
    writeOutput(cmd.output, source);

    if (!cmd.quiet && cmd.output) {
      console.log("%s: API blueprint has been generated", cmd.output);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

async function jsonCmd(input, cmd) {
  try {
    const data = await json(input);
    writeOutput(cmd.output, data);

    if (!cmd.quiet && cmd.output) {
      console.log("%s: API elements JSON has been generated", cmd.output);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

async function lintCmd(input, cmd) {
  try {
    const result = await lint(input);

    if (result.length === 0) {
      if (!cmd.quiet) {
        console.log("OK");
      }
    } else {
      if (!cmd.quiet) {
        renderLint(result);
      }

      process.exit(1);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

async function listCmd(input, inputs) {
  inputs.unshift(input);

  try {
    const items = await Promise.all(inputs.map(val => load(val)));
    items.forEach(item => renderList(item));
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

function parseBinding(str) {
  const [hostStr, portStr] = str.split(":");
  const port = parseInt(portStr, 10);
  const host = hostStr === "" ? undefined : hostStr;

  return [host, port];
}

function normalizePath(pathName) {
  if (pathName) {
    const str = pathName.replace(/{/g, ":").replace(/}/g, "");
    return str === "" ? "/" : str;
  }

  return pathName;
}

function mockHandler(action, req, res) {
  const { status } = preferHeader(req.get("Prefer"));

  let content = find(action.transactions, obj => {
    return obj.response.statusCode === parseInt(status, 10);
  });

  if (!content) {
    content = action.transactions[0];
  }

  const item = content.response;

  if (!(item.example && item.contentType)) {
    res.sendStatus(item.statusCode);
    return;
  }

  const contentType = item.contentType === "" ? "default" : item.contentType;

  res.status(item.statusCode).format({
    [contentType]: () => res.send(item.example)
  });
}

async function mockCmd(input, inputs, cmd) {
  inputs.unshift(input);

  try {
    const app = express();
    const router = express.Router();
    const items = await Promise.all(inputs.map(val => load(val)));

    const result = items.map(item => {
      return item.actions.map(action => {
        action.pathRoute = normalizePath(action.path);
        return action;
      });
    });

    const actions = flattenDepth(result, 2);

    actions.forEach(action => {
      action.transactions.forEach(transaction => {
        console.log(
          [
            action.method.toUpperCase(),
            transaction.response.statusCode,
            action.path
          ].join("\t")
        );
      });

      router[action.method.toLowerCase()](action.pathRoute, (req, res) => {
        mockHandler(action, req, res);
      });
    });

    app.use(morgan("dev"));
    app.use(router);
    app.use((req, res) => res.sendStatus(404));

    const server = http.createServer(app);
    const bind = cmd.bind ? cmd.bind : ":8087";
    const [host, port] = parseBinding(bind);

    server.on("listening", () => {
      console.log("-".repeat(64));
      console.log(`Mock server is ready. Use ${bind}`);
      console.log("-".repeat(64));
    });

    server.listen(port, host);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

async function htmlExec(input, cmd) {
  try {
    const result = await load(input);

    if (cmd.output && !cmd.output.endsWith(".html")) {
      const output = await renderHtmlMulti(result, cmd);

      if (!cmd.quiet) {
        console.log(`HTML multi-pages output is ready: ${output}`);
      }
    } else {
      const data = await renderHtmlSingle(result, cmd);

      writeOutput(cmd.output, data);

      if (!cmd.quiet && cmd.output) {
        console.log(`HTML output is ready: ${cmd.output}`);
      }
    }
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

async function htmlCmd(input, cmd) {
  watchCmd(input, cmd, htmlExec);
}

async function httpSingle(input, cmd) {
  const result = await load(input);
  const data = await renderHtmlSingle(result, cmd);

  const app = express();
  const server = http.createServer(app);
  const bind = cmd.bind ? cmd.bind : ":8088";
  const [host, port] = parseBinding(bind);

  app.use(morgan("dev"));
  app.get("/", (req, res) => {
    res.send(data);
  });

  server.on("listening", () => {
    console.log(`HTTP server is ready. Use ${bind}`);
    console.log("-".repeat(64));
  });

  server.listen(port, host);
}

async function httpMulti(input, cmd) {
  const result = await load(input);
  const output = await renderHtmlMulti(result, cmd);

  const app = express();
  const server = http.createServer(app);
  const bind = cmd.bind ? cmd.bind : ":8088";
  const [host, port] = parseBinding(bind);

  app.use(morgan("dev"));
  app.use(express.static(output));

  server.on("listening", () => {
    console.log(`HTTP server is ready. Use ${bind}`);
    console.log("-".repeat(64));
  });

  server.listen(port, host);
}

async function httpCmd(input, cmd) {
  try {
    if (cmd.multi) {
      await httpMulti(input, cmd);
    } else {
      await httpSingle(input, cmd);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }
}

commander
  .version(version, "-v, --version")
  .name("snowboard")
  .description("API blueprint toolkit")
  .usage("<command> [options] <input>");

commander
  .command("lint")
  .description("validate API blueprint")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(lintCmd);

commander
  .command("html")
  .description("render HTML documentation")
  .option("-o, --output <output>", "HTML output file/directory")
  .option("-t, --template <name>", "template for HTML documentation")
  .option("-w, --watch", "watch for the files changes")
  .option("-n, --watch-interval <value>", "Set watch interval. This activates polling watcher. Accepted format like: 100ms, 1s, etc")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(htmlCmd);

commander
  .command("http")
  .description("HTML documentation via HTTP server")
  .option("-t, --template <name>", "template for HTML documentation")
  .option(
    "-b, --bind [address]",
    'HTTP server listen address (default: ":8088")'
  )
  .option("-m, --multi", "multi pages mode")
  .arguments("<input>")
  .action(httpCmd);

commander
  .command("apib")
  .description("render API blueprint")
  .option("-o, --output <output>", "API blueprint output file")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(apibCmd);

commander
  .command("json")
  .description("render API elements json")
  .option("-o, --output <output>", "API elements output file")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(jsonCmd);

commander
  .command("mock")
  .description("run mock server")
  .option(
    "-b, --bind [address]",
    'HTTP server listen address (default: ":8087")'
  )
  .arguments("<input> [inputs...]")
  .action(mockCmd);

commander
  .command("list")
  .description("list available routes")
  .arguments("<input> [inputs...]")
  .action(listCmd);

commander.on("command:*", unknownCommand);
commander.parse(process.argv);

if (process.argv.length <= 2) {
  commander.help();
}
