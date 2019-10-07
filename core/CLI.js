#!/usr/bin/env node

global.projectPWD = process.cwd();
global.CoreUtil = require("./CoreUtil");
const fs = require("fs");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError, AVAEnvironment } = require("../index.js");

cmdValue = process.argv[process.argv[0] === "sudo" ? 3 : 2];
envValue = process.argv[process.argv[0] === "sudo" ? 4 : 3];
argValue = process.argv[process.argv[0] === "sudo" ? 5 : 4];

if (typeof cmdValue !== "undefined") {
  if (package && package.dependencies && package.dependencies.avacore) {
    const version = package.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    const cliVersion = avalanchePackage.version;
    const cliValue = parseInt(projectVersion.split(".").join(""));
    const projectValue = parseInt(cliVersion.split(".").join(""));
    if (cmdValue !== "update" && cmdValue !== "update") {
      if (cliValue > projectValue) {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice) Your AVA-CLI version (${cliVersion}) is lower than your project version of Avalanche (${projectVersion}). Update the AVA-CLI.\x1b[0m`);
      }
      if (projectValue > cliValue) {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice) Your project version of Avalanche (${projectVersion}) is lower than your AVA-CLI version (${cliVersion}). Update the avacore package.\x1b[0m`);
      }
    }
  }

  var found = false;
  const path = `${__dirname}/commands`;
  const commands = fs.readdirSync(path);
  for (const key of commands) {
    const command = require(`${path}/${key}`);
    if (cmdValue === command.command) {
      if (command.enabled) {
        if (command.scope === "PROJECT") {
          if (!CoreUtil.isAVAProject()) {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) This is not an Avalanche project. use "avalanche init" to initialize project.\x1b[0m`);
            process.exit(AVAError.NOTANAVAPROJECT);
            return;
          }
          if (!CoreUtil.isAVACoreInstalled()) {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) The avacore is not installed. Are you working in an experimental project?\x1b[0m`);
          }
          if (package && package.avalancheConfig && package.avalancheConfig.preferredEnvironment) {
            global.environment = new AVAEnvironment(package.avalancheConfig.preferredEnvironment);
          }
        }
        command.execute(envValue, argValue);
      } else {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Command disabled.\x1b[0m`);
        return;
      }
      found = true;
    }
  }
  if (!found) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Command not found.\x1b[0m`);
    return;
  }
}