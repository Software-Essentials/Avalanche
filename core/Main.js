// Dependencies
const express = require("express");

// Imports
const Kernel = require("./Kernel.js");
const Webserver = require("./Webserver.js");
const Environment = require("./Environment.js");

const app = express();

global.environment = new Environment();

const server = new Webserver(app);
const stream = server.getStream();
const kernel = new Kernel(app, stream);