import fs from "fs";


/**
 * @description Prints the help page.
 */
function help() {
  var string = "\nUsage: \tavalanche COMMAND\nUsage: \tava COMMAND\n\nCommands:\n";
  const path = `${__dirname}`;
  const commands = fs.readdirSync(path);
  for (const key of commands) {
    const command = require(`${path}/${key}`);
    string += `  ${!command.enabled ? "\x1b[31m" : ""}\x1b[1m${command.command}\x1b[0m    \x1b[2m\x1b[3m\t${command.description} ${!command.enabled ? "\x1b[31m\x1b[1m(DISABLED)" : ""}\x1b[0m\n`;
  }
  console.log(string);
}


module.exports.execute = help;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "GLOBAL";
module.exports.command = "help";
module.exports.description = "Prints the help page.";