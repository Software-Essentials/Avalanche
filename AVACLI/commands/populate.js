import inquirer from "inquirer";
import ACSeeder from "../../AVACore/ACSeeder";
import { terminalPrefix } from "../../AVACore/ACUtil";


/**
 * @description Migrate.
 */
function populate() {
  const seeder = new ACSeeder();
  const choices = [
    "\x1b[32m\x1b[1mSAFE\x1b[0m       \x1b[3m(Only creates records that don't exist yet)\x1b[0m",
    "\x1b[33m\x1b[1mOVERWRITE\x1b[0m  \x1b[3m(Merges population over your existing records)\x1b[0m",
    "\x1b[31m\x1b[1mWIPE\x1b[0m       \x1b[3m(Wipes your data and then populates)\x1b[0m"
  ];
  const questions = [
    {
      type: "list",
      name: "mode",
      message: "Choose a populating mode:",
      default: 0,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      choices: choices
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const mode = ["SAFE", "OVERWRITE", "WIPE"];
    var options = {};
    choices.forEach((value, index, array) => {
      options[value] = index;
    });
    const choice = options[answers.mode];
    if(typeof mode[choice] === "string") {
      const option = options[answers.mode];
      seeder.seed(mode[option], () => {
        process.exit(0);
      });
      return;
    }
    console.log(`${terminalPrefix()}\x1b[31m (error)\x1b[0m`);
  });
}


module.exports.execute = populate;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "populate";
module.exports.description = "Populates your database with seed data.";