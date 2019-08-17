#!/usr/bin/env node

global.projectPWD = process.env.PWD;
global.CoreUtil = require("./CoreUtil");

// Dependencies
const express = require("express");
const Kernel = require("./Kernel.js");
const Webserver = require("./Webserver.js");
const AVAEnvironment = require("../foundation/AVAEnvironment.js");

const app = express();

console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Starting server.\x1b[0m`);

global.environment = new AVAEnvironment(arguments[0]);

const server = new Webserver(app);
const stream = server.getStream();
const kernel = new Kernel(app, stream);

