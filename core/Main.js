#!/usr/bin/env node

global.projectPWD = process.cwd();

require = require("esm")(module);
const AVAEnvironment = require("../foundation/AVAEnvironment").default;
const express = require("express");
const { terminalPrefix } = require("./CoreUtil");

const cmdValue = process.argv[process.argv[0] === "sudo" ? 3 : 2];
const envValue = process.argv[process.argv[0] === "sudo" ? 4 : 3];

if (cmdValue !== "run") {
  process.exit(0);
} else {
  global.environment = new AVAEnvironment(envValue);

  const Kernel = require("./Kernel.js").default;
  const Webserver = require("./Webserver.js").default;

  const app = express();

  console.log(`${terminalPrefix()}\x1b[32m Starting server.\x1b[0m`);

  const server = new Webserver(app);
  const stream = server.getStream();
  new Kernel(app, stream);
}