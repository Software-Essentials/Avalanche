import { exec } from "child_process";
import { terminalPrefix } from "../../AVACore/ACUtil";


/**
 * @description Upgrades Avalanche project.
 */
function upgrade() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => { };
  process.stdout.clearLine();
  var i = 0, total = 10;
  const animation = setInterval(() => {
    process.stdout.clearLine();
    i = (i + 1) % total;
    const r = total - i;
    var dots = "〈" + new Array(i + 1).join("◼︎") + (new Array(r).join(" ")) + "〉";
    process.stdout.write(`${terminalPrefix()}\x1b[32m Upgrading Avalanche project ${dots}\x1b[0m`)
    process.stdout.cursorTo(0);
  }, 50);
  const version = require(`${projectPWD}/package.json`).dependencies.avacore.split("^")[1];
  const iProcess = exec("npm uninstall avacore && npm install avacore", (error, stout, sterr) => { });
  iProcess.on("error", (error) => {
    clearInterval(animation);
    console.log(`${terminalPrefix()}\x1b[34m Sorry! I was unable to fix any issues :(\x1b[0m`);
  });
  iProcess.on("exit", (code, signal) => {
    clearInterval(animation);
    process.stdout.clearLine();
    const currentVersion = require(`${projectPWD}/package.json`).dependencies.avacore.split("^")[1];
    process.stdout.write(`\n${terminalPrefix()}\x1b[32m Avalanche project has been upgraded to the latest stable version (${currentVersion}).\n\x1b[0m`);
    ready();
  });
}


module.exports.execute = upgrade;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "upgrade";
module.exports.description = "Upgrades Avalanche project. (DANGEROUS)";