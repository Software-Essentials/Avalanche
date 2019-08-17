const fs = require("fs");


/**
 * @description Prints the help page.
 */
function help() {
  var string = "\n";
  const path = `${__dirname}`;
  const commands = fs.readdirSync(path);
  for (const key of commands) {
    const command = require(`${path}/${key}`);
    string += `\t\x1b[1m${command.command}\x1b[0m\x1b[2m\x1b[3m\t\t${command.description}\x1b[0m\n`;
  }
  console.log(string);
}


module.exports.execute = help;
module.exports.command = "help";
module.exports.description = "Prints the help page.";