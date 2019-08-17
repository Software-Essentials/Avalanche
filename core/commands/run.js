const CoreUtil = require("../CoreUtil");
const fs = require("fs");
const { exec } = require("child_process");
const { AVAEnvironment } = require("../../index");


/**
 * @description Runs your Avalanche application.
 */
function run() {
  if(CoreUtil.getRoutes().length < 1) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice) Your app has no routes. (You might want to add some)\x1b[0m`);
  }
  const environmentName = typeof arguments[0] === "string" ? arguments[0] : null;
  const environment = new AVAEnvironment(environmentName);
  var process = start(environmentName);
  if(environment.restartOnFileChange) {
    const directory = `${projectPWD}/app`;
    const folders = CoreUtil.directoryLooper(directory, []).children;
    for(const i in folders) {
      const folder = folders[i];
      if(fs.lstatSync(folder).isDirectory()) {
        const files = fs.readdirSync(folder);
        for(const i in files) {
          const file = files[i];
          const path = `${folder}/${file}`;
          if(fs.lstatSync(path).isFile()) {
            CoreUtil.startWatchingSession(path, () => {
              process.kill("SIGINT");
              process = start(environmentName);
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
  const command = environmentFormatted ? `node ${__dirname}/../Main run ${environmentFormatted}` : `node ${__dirname}/../Main run`;
  const process = exec(command, (error, stdout, stderr) => {
    if(error) {
      if(error.signal === "SIGINT") {
        return;
      }
      console.log("ERROR:", error);
    }
  });
  process.stdout.on("data", (data) => {
    console.log(data.toString().trim());
  });
  process.stderr.on("data", (data) => {
    console.log(data.toString().trim());
  });
  process.on("exit", (code) => {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m Server stopped.\x1b[0m`);
  });
  return process;
}


module.exports.execute = run;
module.exports.command = "run";
module.exports.description = "Runs your application.";