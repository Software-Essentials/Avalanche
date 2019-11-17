#!/usr/bin/env node

global.projectPWD = process.cwd();

require = require("esm")(module);
const { AFEnvironment } = require("../AVAFoundation/index");
const express = require("express");
const { terminalPrefix } = require("./ACUtil");

const cmdValue = process.argv[process.argv[0] === "sudo" ? 3 : 2];
const envValue = process.argv[process.argv[0] === "sudo" ? 4 : 3];

if (cmdValue !== "run") {
  process.exit(0);
} else {
  global.environment = new AFEnvironment(envValue);

  const ACKernel = require("./ACKernel.js").default;
  const ACWebServer = require("./ACWebServer.js").default;

  const app = express();

  console.log(`${terminalPrefix()}\x1b[32m Starting server.\x1b[0m`);

  const server = new ACWebServer(app);
  const stream = server.getStream();
  new ACKernel(app, stream);
}