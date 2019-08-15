#!/usr/bin/env node

// Dependencies
const express = require("express");
const CoreUtil = require("./CoreUtil");
const Kernel = require("./Kernel.js");
const Webserver = require("./Webserver.js");
const AVAEnvironment = require("./AVAEnvironment.js");

const app = express();

console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Starting server.\x1b[0m`);

global.environment = new AVAEnvironment(arguments[0]);

const server = new Webserver(app);
const stream = server.getStream();
const kernel = new Kernel(app, stream);

