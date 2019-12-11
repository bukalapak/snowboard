import { readFileSync } from "fs";
import { resolve } from "path";
import commander from "commander";

import lint from "./commands/lint";
import apib from "./commands/apib";
import json from "./commands/json";
import list from "./commands/list";
import mock from "./commands/mock";
import html from "./commands/html";
import http from "./commands/http";

import watch, { watchBuilder } from "./commands/helper/watch";
import { httpServer, httpBind, checkSSL } from "./commands/helper";

const { version } = JSON.parse(
  readFileSync(resolve(__dirname, "..", "package.json"), "utf8")
);

function safeExit(code) {
  if (!commander.watch) {
    process.exit(code);
  }
}

async function watchCmd(input, cmd, fn) {
  watch(input, cmd, commander, async (input, cmd) => {
    try {
      await fn(input, cmd);
    } catch (err) {
      console.error("ERROR:", err.message);
      safeExit(2);
    }
  });
}

async function apibCmd(input, cmd) {
  await watchCmd(input, cmd, apib);
}

async function jsonCmd(input, cmd) {
  await watchCmd(input, cmd, json);
}

async function lintCmd(input, cmd) {
  await watchCmd(input, cmd, async () => {
    const status = await lint(input, cmd);
    safeExit(status);
  });
}

async function listCmd(input, inputs, cmd) {
  inputs.unshift(input);
  await watchCmd(inputs, cmd, list);
}

async function execCmd(input, cmd, fn) {
  try {
    await fn(input, cmd, commander);
  } catch (err) {
    console.error("ERROR:", err.message);
    safeExit(2);
  }
}

async function htmlCmd(input, cmd) {
  await execCmd(input, cmd, html);
}

function mockServer(app, cmd) {
  const [host, port] = httpBind(cmd, { bind: ":8087" });

  const server = httpServer(app, cmd);
  server.on("listening", () => {
    console.log("-".repeat(64));
    console.log(`Mock server is ready. Use ${host || ""}:${port}`);
    console.log("-".repeat(64));
  });

  return server.listen(port, host);
}

async function mockCmd(input, inputs, cmd) {
  execCmd(input, cmd, (_, cmd) => checkSSL(cmd));

  inputs.unshift(input);

  let server;

  if (commander.watch) {
    const watcher = watchBuilder(input, commander);

    watcher.on("all", async () => {
      if (server) {
        server.close();

        console.log("=".repeat(64));
        console.log("Restarting...");
        console.log("-".repeat(64));
      }

      server = mockServer(await mock(inputs, cmd), cmd);
    });
  } else {
    server = mockServer(await mock(inputs, cmd), cmd);
  }
}

function httpCmd(input, cmd) {
  execCmd(input, cmd, http);
}

commander
  .version(version, "-v, --version")
  .name("snowboard")
  .description("API blueprint toolkit")
  .option("-w, --watch", "watch for the files changes")
  .option(
    "-n, --watch-interval <value>",
    "set watch interval. This activates polling watcher. Accepted format: 100ms, 1s, etc"
  )
  .usage("<command> [options] <input>");

commander
  .command("lint")
  .description("validate API blueprint")
  .option("-j, --json", "json output")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(lintCmd);

commander
  .command("html")
  .description("render HTML documentation")
  .option("-o, --output <output>", "HTML output directory")
  .option("-t, --template <name>", "template for HTML documentation")
  .option("-O, --optimized", "enable optimized mode")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(htmlCmd);

commander
  .command("http")
  .description("HTML documentation via HTTP server")
  .option("-t, --template <name>", "template for HTML documentation")
  .option("-O, --optimized", "enable optimized mode")
  .option("-S, --ssl", "enable https")
  .option("-C, --cert <cert.pem>", "ssl cert file")
  .option("-K, --key <key.pem>", "ssl key file")
  .option(
    "-b, --bind [address]",
    'HTTP server listen address (default: ":8088")'
  )
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
  .option("-S, --ssl", "enable https")
  .option("-C, --cert <cert.pem>", "ssl cert file")
  .option("-K, --key <key.pem>", "ssl key file")
  .option(
    "-b, --bind [address]",
    'HTTP server listen address (default: ":8087")'
  )
  .arguments("<input> [inputs...]")
  .action(mockCmd);

commander
  .command("list")
  .description("list routes")
  .option("-j, --json", "json output")
  .arguments("<input> [inputs...]")
  .action(listCmd);

commander.on("command:*", () => {
  console.error("Unknown command");
  process.exit(1);
});

commander.parse(process.argv);

if (process.argv.length <= 2) {
  commander.help();
}
