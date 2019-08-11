// Dependencies
const express = require("express");

// Imports
const Kernel = require("./Kernel.js");
const Webserver = require("./Webserver.js");
const Environment = require("./AVAEnvironment.js");

const app = express();
var initialised = false;

function run() {
    if(initialised) {
        return;
    }
    if(typeof arguments[0] === "string") {
        global.environment = new Environment(arguments[0]);
    } else {
        global.environment = new Environment();
    }
    initialised = true;
}

module.exports.run = run;

run();

const server = new Webserver(app);
const stream = server.getStream();
const kernel = new Kernel(app, stream);

