import { rmdirSyncRecursive } from "../../AVAFoundation/AFUtil";
import { terminalPrefix } from "../../AVACore/ACUtil";
import { exec } from "child_process";


/**
 * @description
 */
function fix() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => { };
  process.stdout.clearLine();
  var i = 0, total = 10;
  const animation = setInterval(() => {
    process.stdout.clearLine();
    i = (i + 1) % total;
    const r = total - i;
    var dots = "〈" + new Array(i + 1).join("◼︎") + (new Array(r).join(" ")) + "〉";
    process.stdout.write(`${terminalPrefix()}\x1b[34m Diagnosing project ${dots}\x1b[0m`)
    process.stdout.cursorTo(0);
  }, 50);
  rmdirSyncRecursive(`${projectPWD}/node_modules`);
  const iProcess = exec("npm install", (error, stout, sterr) => { });
  iProcess.on("error", (error) => {
    clearInterval(animation);
    console.log(`${terminalPrefix()}\x1b[34m Sorry! I was unable to fix any issues :(\x1b[0m`);
  });
  iProcess.on("exit", (code, signal) => {
    clearInterval(animation);
    process.stdout.clearLine();
    process.stdout.write(`\n${terminalPrefix()}\x1b[32m Cleaned project, try now.\n\x1b[0m`)
    ready();
  });
}


module.exports.execute = fix;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "fix";
module.exports.description = "Tries to fix your Avalanche Project.";