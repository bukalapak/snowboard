#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const commander = require("commander");

const {
  apib,
  json,
  lint,
  list,
  html,
  mock,
  http,
  watch,
  htmlBundleSpinner,
  watchBuilder
} = require("./command");

const { version } = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")
);

function safeExit(code) {
  if (!commander.watch) {
    process.exit(code);
  }
}

async function execCmd(input, cmd, fn) {
  try {
    checkSsl(cmd);
    await fn(input, cmd);
  } catch (err) {
    console.error(err.message);
    safeExit(2);
  }
}

async function watchCmd(input, cmd, fn) {
  watch(input, cmd, commander, async (input, cmd) => {
    try {
      await fn(input, cmd);
    } catch (err) {
      console.error(err.message);
      safeExit(2);
    }
  });
}

function apibCmd(input, cmd) {
  watchCmd(input, cmd, apib);
}

function jsonCmd(input, cmd) {
  watchCmd(input, cmd, json);
}

function lintCmd(input, cmd) {
  watchCmd(input, cmd, async (input, cmd) => {
    const status = await lint(input, cmd);

    if (status == 1) {
      safeExit(1);
    }
  });
}

function listCmd(input, inputs, cmd) {
  inputs.unshift(input);
  watchCmd(inputs, cmd, list);
}

function checkSsl(cmd) {
  if (cmd.ssl && !(cmd.cert && cmd.key)) {
    throw new Error(
      "HTTPS requires ssl cert and key file. Pass it using `-C` and `-K` flag."
    );
  }
}

function htmlCmd(input, cmd) {
  watchCmd(input, cmd, html);
}

async function httpCmd(input, cmd) {
  execCmd(input, cmd, (_, cmd) => checkSsl(cmd));
  execCmd(input, cmd, http);

  if (commander.watch) {
    const watcher = watchBuilder(input, commander);

    watcher.on("change", async () => {
      await htmlBundleSpinner(input, cmd);
    });
  }
}

async function mockCmd(input, inputs, cmd) {
  execCmd(input, cmd, (_, cmd) => checkSsl(cmd));

  inputs.unshift(input);

  let server = await mock(inputs, cmd);

  if (commander.watch) {
    const watcher = watchBuilder(inputs, commander);

    watcher.on("change", async () => {
      if (server) {
        server.close();
      }

      console.log("=".repeat(64));
      console.log("Restarting...");
      console.log("-".repeat(64));

      // eslint-disable-next-line require-atomic-updates
      server = await mock(inputs, cmd);
    });
  }
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
  .option("-c, --config <config>", "configuration")
  .option("-p, --playground", "enable playground mode")
  .option("-O, --optimized", "enable optimized mode")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(htmlCmd);

commander
  .command("http")
  .description("HTML documentation via HTTP server")
  .option("-t, --template <name>", "template for HTML documentation")
  .option("-c, --config <config>", "configuration")
  .option("-p, --playground", "enable playground mode")
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
  .option("-s, --simple", "simple mode")
  .option("-q, --quiet", "quiet mode")
  .arguments("<input>")
  .action(jsonCmd);

commander
  .command("mock")
  .description("run mock server")
  .option("-c, --config <config>", "configuration")
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
