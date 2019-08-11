#!/usr/bin/env node

const projectPWD = process.env.PWD;
const program = require("commander");
const fs = require("fs");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError } = require("../index.js");
const { fix, run, init, info, routes, upgrade } = require("./Operations.js")

program
  .version("1.2.3")
  .arguments("<cmd> [env]")
  .action(function(cmd, env) {
    cmdValue = cmd;
    envValue = env;
  })
  .parse(process.argv)

program
  .command("init [example]")
  .description("Initializes your Avalanche project")
  .action(function() {
    // console.log("Initialize project");
    init();
  })
  .parse(process.argv);
  
program
  .command("run [environment]")
  .description("Runs your application")
  .action(function() {
    // console.log("Run application");
  })
  .parse(process.argv);

program
  .command("reload")
  .description("Reloads caches")
  .action(function() {
    // console.log("Reload application");
  })
  .parse(process.argv);

program
  .command("upgrade")
  .description("Upgrades Avalanche your project")
  .action(function() {
    // console.log("Upgrade project");
  })
  .parse(process.argv);

program
  .command("install")
  .description("Installes files in your project")
  .action(function() {
    // console.log("Install snippets");
  })
  .parse(process.argv);

program
  .command("make")
  .description("Creates a component in your project")
  .action(function() {
    // console.log("Make component");
  })
  .parse(process.argv);


if (typeof cmdValue !== "undefined") {
  if(typeof package === "null" && typeof package.avalancheConfig === "undefined" && cmdValue !== "init" && cmdValue !== "version" && cmdValue !== "info") {
    console.log("\x1b[31m%s\x1b[0m", `(error) This is not an Avalanche project. use "avalanche init" to initialize.`);
    process.exit(AVAError.prototype.NOTANAVAPROJECT);
  }
  switch(cmdValue) {
    case "init":
      init(envValue);
      break;
    case "run":
      run(envValue);
      break;
    case "routes":
      routes();
      break;
    case "upgrade":
      upgrade();
      break;
    case "fix":
      fix();
      break;
    case "version":
      console.log(avalanchePackage.version);
      break;
    case "info":
      info();
      break;
    default:
      console.log("\x1b[31m%s\x1b[0m", `[AVALANCHE] Command not recognised!`);
  }
}

module.exports.run = run;