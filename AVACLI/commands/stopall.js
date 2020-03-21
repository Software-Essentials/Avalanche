import fs from "fs";
import { exec, execSync } from "child_process";
import * as ACUtil from "../../AVACore/ACUtil";

const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Terminates all running Avalanche application processes.
 */
function stopall() {
  var animation = ACUtil.progressAnimation("Terminating processes");
  setTimeout(() => {
    try {
      exec(`lsof -i tcp`, (error, output, stderr) => {
        const rows = output.split("\n");
        var pids = [];
        for (const row of rows) {
          const rowCells = row.replace(/ +(?= )/g, "").trim().split(" ");
          for (let i = 0; i < rowCells.length; i++) {
            const cell = rowCells[i];
            if (cell === "node" && rowCells.length > i) {
              pids.push(rowCells[i + 1]);
              break;
            }
          }
        }
        for (const pid of pids) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[33m Killing ${pid}\x1b[0m`);
          execSync(`kill ${pid}`, { stdio: "pipe" }).toString();
        }
        clearInterval(animation);
        console.log(`${ACUtil.terminalPrefix()}\x1b[32m ${pids.length} processes terminated.\x1b[0m`);
      });
    } catch (error) {
      clearInterval(animation);
    }
  }, 100);
}

module.exports.execute = stopall;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "GLOBAL";
module.exports.command = "stopall";
module.exports.description = "Terminates all running Avalanche application processes.";