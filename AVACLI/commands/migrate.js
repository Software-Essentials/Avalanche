import inquirer from "inquirer";
import ACMigrator from "../../AVACore/ACMigrator";
import ACPopulator from "../../AVACore/ACPopulator";
import { terminalPrefix } from "../../AVACore/ACUtil";


/**
 * @description Migrate.
 */
async function migrate() {
  const migrator = new ACMigrator();
  const seeder = new ACPopulator();
  const choices = [
    "\x1b[32m\x1b[1mSAFE\x1b[0m       \x1b[3m(Only migrates zones/tables or records that don't exist yet)\x1b[0m",
    "\x1b[33m\x1b[1mOVERWRITE\x1b[0m  \x1b[3m(Migrates over your existing zones/tables and records)\x1b[0m",
    "\x1b[31m\x1b[1mWIPE\x1b[0m       \x1b[3m(Wipes your storage/database and then migrates)\x1b[0m"
  ];
  const questions = [
    {
      type: "list",
      name: "mode",
      message: "Choose a migration mode:",
      default: 0,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      choices: choices
    },
    {
      type: "confirm",
      name: "populate",
      message: "Also populate?",
      default: true,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m"
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
      await migrator.migrate(mode[option], async (success) => {
        if (success) {
          if(answers.populate) {
            await seeder.seed(mode[option], () => {
              process.exit(0);
            });
          } else {
            process.exit(0);
          }
        }
      });
      return;
    }
    console.log(`${terminalPrefix()}\x1b[31m (error)\x1b[0m`);
  } catch (error) {
    console.log("INQUIRERY ERROR", error);
  }
}


module.exports.execute = migrate;
module.exports.enabled = true;
module.exports.requireEnvironment = true;
module.exports.scope = "PROJECT";
module.exports.command = "migrate";
module.exports.description = "Migrates to your database/storage based on the models in your project.";