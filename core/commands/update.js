const CoreUtil = require("../CoreUtil");
const { exec } = require("child_process");


/**
 * @description Updates Avalanche CLI
 */
function update() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => {};
  process.stdout.clearLine();
  var i = 0, total = 10;
  const animation = setInterval(() => {
    process.stdout.clearLine();
    i = (i + 1) % total;
    const r = total - i;
    var dots = "{ " + new Array(i + 1).join("=") + ">" + (new Array(r).join(" ")) + " [=] }";
    process.stdout.write(`${CoreUtil.terminalPrefix()}\x1b[32m Updating the Avalanche CLI ${dots}\x1b[0m`)
    process.stdout.cursorTo(0);
  }, 50);
  const version = require(`${__dirname}/../../package.json`).version;
  const iProcess = exec("npm uninstall -g avacore && npm install -g avacore", (error, stout, sterr) => {});
  iProcess.on("error", (error) => {
    clearInterval(animation);
    console.log(`${CoreUtil.terminalPrefix()}\x1b[34m Sorry! I was unable to fix any issues :(\x1b[0m`);
  });
  iProcess.on("exit", (code, signal) => {
    clearInterval(animation);
    process.stdout.clearLine();
    const currentVersion = require(`${__dirname}/../../package.json`).version;
    if(version === currentVersion) {
        process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[34m Already up-to-date (${currentVersion}).\n\x1b[0m`);
    } else {
        process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[32m The Avalanche CLI has been updated to the latest stable version (${currentVersion}).\n\x1b[0m`);
    }
    ready();
  });
}


module.exports.execute = update;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "update";
module.exports.description = "Updates the Avalanche CLI.";