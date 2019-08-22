#!/usr/bin/env node

global.projectPWD = process.cwd();
global.CoreUtil = require("./CoreUtil");

const { AVAEnvironment } = require("../index");
const express = require("express");

cmdValue = process.argv[process.argv[0] === "sudo" ? 3 : 2];
envValue = process.argv[process.argv[0] === "sudo" ? 4 : 3];

if (cmdValue !== "run") {
  process.exit(0);
  return;
}

global.environment = new AVAEnvironment(envValue);

const Kernel = require("./Kernel.js");
const Webserver = require("./Webserver.js");

const app = express();

console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Starting server.\x1b[0m`);

const server = new Webserver(app);
const stream = server.getStream();
const kernel = new Kernel(app, stream);

