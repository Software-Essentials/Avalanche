import fs from "fs";
import path from "path";
import AVAEnvironment from "../../AVAFoundation/AVAEnvironment";
import * as CoreUtil from "../CoreUtil";
import { exec } from "child_process";

const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Runs your Avalanche application.
 */
function run() {
  if (CoreUtil.getRoutes().length < 1) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice) Your app has no routes. (You might want to add some)\x1b[0m`);
  }
  var environmentName = null;
  if (typeof arguments[0] === "string") {
    environmentName = arguments[0];
  } else {
    if (pkg && pkg.avalancheConfig && pkg.avalancheConfig.preferredEnvironment) {
      environmentName = pkg.avalancheConfig.preferredEnvironment;
    } else {
      environmentName = null;
    }
  }
  global.environment = new AVAEnvironment(environmentName);
  var cProcess = start(environmentName);
  if (environment.restartOnFileChange) {
    const directory = `${projectPWD}/app`;
    const folders = CoreUtil.directoryLooper(directory, []).children;
    for (const i in folders) {
      const folder = folders[i];
      if (fs.lstatSync(folder).isDirectory()) {
        const files = fs.readdirSync(folder);
        for (const i in files) {
          const file = files[i];
          const path = `${folder}/${file}`;
          if (fs.lstatSync(path).isFile()) {
            CoreUtil.startWatchingSession(path, () => {
              cProcess.kill("SIGQUIT")
              cProcess = start(environmentName);
            });
          }
        }
      }
    }
  }
}


/**
 * @description Starts up the server.
 * @param {String} environment 
 */
function start(environment) {
  const environmentFormatted = typeof environment === "string" ? environment.split(" ").join("").trim() : undefined;
  const mainPath = path.normalize(`${__dirname}/../Main.js`);
  const command = environmentFormatted ? `"${mainPath}" run ${environmentFormatted}` : `"${mainPath}" run`;
  const cProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      if (error.signal === "SIGINT") {
        return;
      }
    }
  });
  cProcess.stdout.on("data", (data) => {
    console.log(data.toString().trim());
  });
  cProcess.stderr.on("data", (data) => {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (FAILURE) \n\n\n\x1b[33m${data.toString().trim()}\n\n\x1b[0m`);
  });
  cProcess.on("close", (code, signal) => {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m Server stopped. \x1b[1m(${signal})\x1b[0m`);
  });
  return cProcess;
}


module.exports.execute = run;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "run";
module.exports.description = "Runs your application.";