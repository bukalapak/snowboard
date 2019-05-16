#!/usr/bin/env node

const fs = require("fs");
const commander = require("commander");
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const preferHeader = require("parse-prefer-header");
const { resolve } = require("path");
const { filter, flattenDepth } = require("lodash");

const {
  read,
  populate,
  load,
  lint,
  json,
  renderLint,
  renderList,
  renderHtmlSingle,
  renderHtmlMulti
} = require("./snowboard");

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

async function lintCmd(input) {
  try {
    const result = await lint(input);

    if (result === null) {
      console.log("OK");
    } else {
      renderLint(result);
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

function sendResponse(res, item) {
  if (item.body === "" && item.contentType === "") {
    res.sendStatus(item.statusCode);
    return;
  }

  const contentType = item.contentType === "" ? "default" : item.contentType;

  res.status(item.statusCode).format({
    [contentType]: () => res.send(item.messageBody)
  });
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

function mockHandler(result, req, res) {
  const filtered = filter(result, {
    method: req.method,
    pathRoute: req.route.path
  });

  const { status } = preferHeader(req.get("Prefer"));

  if (filtered.length > 0) {
    let content = filtered.find(item => {
      return item.statusCode === parseInt(status, 10);
    });

    if (!content) {
      content = filtered[0];
    }

    sendResponse(res, content);
  }
}

async function mockCmd(input, inputs, cmd) {
  inputs.unshift(input);

  try {
    const app = express();
    const router = express.Router();
    const data = await Promise.all(inputs.map(val => load(val)));
    const items = await Promise.all(data.map(val => populate(val)));
    const result = flattenDepth(items, 2);

    result.map(item => (item.pathRoute = normalizePath(item.path)));
    result.forEach(item => {
      console.log([item.method, item.statusCode, item.path].join("\t"));

      router[item.method.toLowerCase()](item.pathRoute, (req, res) => {
        mockHandler(result, req, res);
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

async function htmlCmd(input, cmd) {
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
  .arguments("<input>")
  .action(lintCmd);

commander
  .command("html")
  .description("render HTML documentation")
  .option("-o, --output <output>", "HTML output file/directory")
  .option("-t, --template <name>", "template for HTML documentation")
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
