import inquirer from "inquirer";
import ACPopulator from "../../AVACore/ACPopulator";
import { terminalPrefix } from "../../AVACore/ACUtil";


/**
 * @description Migrate.
 */
async function populate() {
  const seeder = new ACPopulator();
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
  try {
    const answers = await inquirer.prompt(questions);
    const mode = ["SAFE", "OVERWRITE", "WIPE"];
    var options = {};
    choices.forEach((value, index, array) => {
      options[value] = index;
    });
    const choice = options[answers.mode];
    if(typeof mode[choice] === "string") {
      const option = options[answers.mode];
      await seeder.seed(mode[option], () => {
        process.exit(0);
      });
      return;
    }
    console.log(`${terminalPrefix()}\x1b[31m (error)\x1b[0m`);
  } catch (error) {
    console.log("INQUIRERY ERROR", error);
  }
}


module.exports.execute = populate;
module.exports.enabled = true;
module.exports.requireEnvironment = true;
module.exports.scope = "PROJECT";
module.exports.command = "populate";
module.exports.description = "Populates your database with seed data.";