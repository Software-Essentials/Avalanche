#!/usr/bin/env node
require = require("esm")(module);
const { isSemVer } = require("../AVAFoundation/AFUtil");
const { terminalPrefix, isAVAProject, isAVACoreInstalled } = require("../AVACore/ACUtil");

global.projectPWD = process.cwd();
const npmRegistryAPIURI = "https://registry.npmjs.com/-/package/avacore/dist-tags";
const fs = require("fs");
const https = require("https");
const Table = require("cli-table");
const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const AFEnvironment = require("../AVAFoundation/AFEnvironment").default;
const AFError = require("../AVAFoundation/AFError").default;

const cmdValue = process.argv[process.argv[0] === "sudo" ? 3 : 2];
const envValue = process.argv[process.argv[0] === "sudo" ? 4 : 3];
const argValue = process.argv[process.argv[0] === "sudo" ? 5 : 4];

main();
function main() {
  if (typeof cmdValue !== "undefined") {
    if (cmdValue !== "update" && cmdValue !== "upgrade") {
      notifyIfInconsistentVersion();
    }
    const path = `${__dirname}/commands`;
    const commands = fs.readdirSync(path);
    for (const key of commands) {
      const command = require(`${path}/${key}`);
      if (cmdValue === command.command) {
        checkForUpdate();
        notifyIfUpdate();
        if (command.enabled) {
          if (command.scope === "PROJECT") {
            if (!isAVAProject()) {
              console.log(`${terminalPrefix()}\x1b[31m (error) This is not an Avalanche project. use "avalanche init" to initialize project.\x1b[0m`);
              process.exit(AFError.NOTANAVAPROJECT);
              return;
            }
            notifyIfExperimental();
            if (pkg && pkg.avalancheConfig && pkg.avalancheConfig.preferredEnvironment) {
              global.environment = new AFEnvironment(pkg.avalancheConfig.preferredEnvironment);
            }
          }
          command.execute(envValue, argValue);
        } else {
          console.log(`${terminalPrefix()}\x1b[31m (error) Command disabled.\x1b[0m`);
          return;
        }
        return;
      }
    }
    console.log(`${terminalPrefix()}\x1b[31m (error) Command not found.\x1b[0m`);
  }
}


function checkForUpdate() {
  https.get(npmRegistryAPIURI, (response) => {
    var body = "";
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => {
      const data = JSON.parse(body)
      if (avalanchePackage) {
        var json = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, "utf8"));
        if (avalanchePackage.avalancheCache) {
          json.avalancheCache.latestUpdate = data.latest;
        } else {
          json.avalancheCache = { latestUpdate: data.latest };
        }
        fs.writeFileSync(`${__dirname}/../package.json`, JSON.stringify(json, null, 2), "utf8");
      }
    });
  }).on("error", (error) => {

  });
}


function notifyIfUpdate() {
  const table = new Table();
  if (avalanchePackage.avalancheCache && avalanchePackage.avalancheCache.latestUpdate) {
    const latestVersion = avalanchePackage.avalancheCache.latestUpdate;
    const currentVersion = avalanchePackage.version;
    if (isSemVer(latestVersion) && isSemVer(currentVersion)) {
      const cMajor = parseInt(currentVersion.split(".")[0]);
      const cMinor = parseInt(currentVersion.split(".")[1]);
      const cPatch = parseInt(currentVersion.split(".")[2]);
      const lMajor = parseInt(latestVersion.split(".")[0]);
      const lMinor = parseInt(latestVersion.split(".")[1]);
      const lPatch = parseInt(latestVersion.split(".")[2]);
      if (lMajor > cMajor) {
        const table = new Table();
        table.push([`\x1b[3m\x1b[1m\x1b[35mGood news! A new major update is available (${latestVersion}). Do "avalanche update" to update the CLI.\x1b[0m`]);
        console.log(`${table.toString()}`);
      } else {
        if (lMinor > cMinor) {
          table.push([`\x1b[3m\x1b[1m\x1b[35mGood news! A new minor update is available (${latestVersion}). Do "avalanche update" to update the CLI.\x1b[0m`]);
          console.log(`${table.toString()}`);
        } else {
          if (lPatch > cPatch) {
            table.push([`\x1b[3m\x1b[1m\x1b[35mGood news! A new patch update is available (${latestVersion}). Do "avalanche update" to update the CLI.\x1b[0m`]);
            console.log(`\n\n${table.toString()}`);
          }
        }
      }
    }
  }
}


function notifyIfExperimental() {
  if (!isAVACoreInstalled()) {
    console.log(`${terminalPrefix()}\x1b[33m (warning) The avacore is not installed. Are you working in an experimental project?\x1b[0m`);
  }
}


function notifyIfInconsistentVersion() {
  if (pkg && pkg.dependencies && pkg.dependencies.avacore) {
    const version = pkg.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    const cliVersion = avalanchePackage.version;
    const cliValue = parseInt(projectVersion.split(".").join(""));
    const projectValue = parseInt(cliVersion.split(".").join(""));
    if (cliValue > projectValue) {
      console.log(`${terminalPrefix()}\x1b[33m (notice) Your AVA-CLI version (${cliVersion}) is lower than your project version of Avalanche (${projectVersion}). Update the AVA-CLI.\x1b[0m`);
    }
    if (projectValue > cliValue) {
      console.log(`${terminalPrefix()}\x1b[33m (notice) Your project version of Avalanche (${projectVersion}) is lower than your AVA-CLI version (${cliVersion}). Update the avacore package.\x1b[0m`);
    }
  }
}