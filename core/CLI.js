#!/usr/bin/env node

const projectPWD = process.env.PWD;
const fs = require("fs");
const CoreUtil = require("./CoreUtil");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError } = require("../index.js");
const { config, run, init, info, make, routes, upgrade, migrate } = require("./Operations.js")

cmdValue = process.argv[2];
envValue = process.argv[3];

if (typeof cmdValue !== "undefined") {
  if(cmdValue !== "init" && cmdValue !== "version" && cmdValue !== "info") {
    if(!CoreUtil.isAVAProject()) {
      console.log(`\x1b[31m[AVALANCHE] (error) This is not an Avalanche project. use "avalanche init" to initialize project.\x1b[0m`);
      process.exit(AVAError.NOTANAVAPROJECT);
      return;
    }
    if(!CoreUtil.isAVACoreInstalled()) {
      console.log(`\x1b[33m[AVALANCHE] (warning) The avacore is not installed. Are you working in an experimental project?\x1b[0m`);
    }
  }
  if(package && package.dependencies && package.dependencies.avacore) {
    const version = package.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    const cliVersion = avalanchePackage.version;
    const cliValue = parseInt(projectVersion.split(".").join(""));
    const projectValue = parseInt(cliVersion.split(".").join(""));
    if(cliValue > projectValue) {
      console.log(`\x1b[34m[AVALANCHE] (notice) Your AVA-CLI version (${cliVersion}) is lower than your project version of Avalanche (${projectVersion}). Update the AVA-CLI.\x1b[0m`);
    }
    if(projectValue > cliValue) {
      console.log(`\x1b[34m[AVALANCHE] (notice) Your project version of Avalanche (${projectVersion}) is lower than your AVA-CLI version (${cliVersion}). Update the avacore package.\x1b[0m`);
    }
  }
  switch(cmdValue) {
    case "init":
      init(process.argv[3]);
      break;
    case "run":
      run(process.argv[3]);
      break;
    case "routes":
      routes();
      break;
    case "upgrade":
      upgrade();
      break;
    case "config":
      config();
      break;
    case "migrate":
      migrate();
      break;
    case "make":
      make(process.argv[3], process.argv[4]);
      break;
    case "version":
      console.log(avalanchePackage.version);
      break;
    case "info":
      info();
      break;
    default:
      console.log("\x1b[31m%s\x1b[0m", `[AVALANCHE] (error) Command not recognised!`);
  }
}

module.exports.run = run;