import fs from "fs";
import { exec } from "child_process";
import * as CoreUtil from "../../AVACore/CoreUtil";


/**
 * @description Updates Avalanche CLI
 */
function update() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => { };

  const pconfig = JSON.parse(fs.readFileSync(`${__dirname}/../../package.json`, "utf8"));
  const latestVersion = pconfig.avalancheCache ? pconfig.avalancheCache.latestUpdate ? pconfig.avalancheCache.latestUpdate : null : null;
  if (pconfig.version === latestVersion) {
    process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[34m The Avalanche CLI is already up-to-date. (v${pconfig.version})\n\x1b[0m`);
    ready();
    return;
  }
  process.stdout.clearLine();
  var i = 0, total = 10;
  const animation = setInterval(() => {
    process.stdout.clearLine();
    i = (i + 1) % total;
    const r = total - i;
    var dots = "〈" + new Array(i + 1).join("◼︎") + (new Array(r).join(" ")) + "〉";
    process.stdout.write(`${CoreUtil.terminalPrefix()}\x1b[32m Updating the Avalanche CLI ${dots}\x1b[0m`)
    process.stdout.cursorTo(0);
  }, 50);
  const version = require(`${__dirname}/../../package.json`).version;
  const iProcess = exec("npm uninstall -g avacore && npm install -g avacore", (error, stout, sterr) => { });
  iProcess.on("error", (error) => {
    clearInterval(animation);
    console.log(`${CoreUtil.terminalPrefix()}\x1b[34m Sorry! I was unable to fix any issues :(\x1b[0m`);
  });
  iProcess.on("exit", (code, signal) => {
    clearInterval(animation);
    process.stdout.clearLine();
    const pconfigAfter = JSON.parse(fs.readFileSync(`${__dirname}/../../package.json`, "utf8"));
    if (pconfigAfter.version === latestVersion) {
      process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[32m The Avalanche CLI has been updated to the latest stable version (v${pconfig.version} > v${pconfigAfter.version}).\n\x1b[0m`);
    } else {
      process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[31m Failed to update the Avalanche CLI! (This could be a permissions issue).\n\x1b[0m`);
    }
    ready();
  });
}


module.exports.execute = update;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "update";
module.exports.description = "Updates the Avalanche CLI.";