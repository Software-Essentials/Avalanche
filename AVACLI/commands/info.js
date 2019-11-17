import fs from "fs";
import Table from "cli-table";
import * as ACUtil from "../../AVACore/ACUtil";

const avalanchePackage = require("../../package.json");
const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Prints information about the current Avalanche version and about the project.
 */
function info() {
  const chars = {
    "right-mid": "",
    "left-mid": "",
    "mid-mid": "",
    "mid": ""
  };
  var table1 = new Table({chars});
  var table2 = new Table({chars});
 
  table1.push(
    ["CLI Version:", `\x1b[34m\x1b[1mv${avalanchePackage.version}\x1b[0m`],
    ["CLI Directory:", `${__dirname}`]
  );
 
  table2.push(
    ["Is NPM project:", `\x1b[33m\x1b[1m${ACUtil.isNodeProject()}\x1b[0m`],
    ["Is Avalanche project:", `\x1b[33m\x1b[1m${ACUtil.isAVAProject()}\x1b[0m`]
  );
  if(ACUtil.isAVACoreInstalled()) {
    const version = pkg.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    table2.push(
      ["AVACore version:", `\x1b[34m\x1b[1mv${projectVersion}\x1b[0m`]
    );
  } else {
    table2.push(
      ["AVACore version:", `\x1b[31m\x1b[1m(NOT INSTALLED)\x1b[0m`]
    );
  }
  if(ACUtil.isAVAProject()) {
    table2.push(
      ["Models:", `\x1b[32m\x1b[1m${ACUtil.getModels().length}\x1b[0m`],
      ["Controllers:", `\x1b[32m\x1b[1m${ACUtil.getControllers().length}\x1b[0m`],
      ["Routes:", `\x1b[32m\x1b[1m${ACUtil.getRoutes().length}\x1b[0m`],
      ["Middleware:", `\x1b[32m\x1b[1m${ACUtil.getMiddleware().length}\x1b[0m`],
      ["Localisations:", `\x1b[32m\x1b[1m${ACUtil.getLocalisations().length}\x1b[0m`],
      ["Translations:", `\x1b[32m\x1b[1m${ACUtil.getTranslations().length}\x1b[0m`],
      ["Helpers:", `\x1b[32m\x1b[1m${Object.keys(ACUtil.getHelpers()).length}\x1b[0m`],
      ["Migrations:", `\x1b[32m\x1b[1m${Object.keys(ACUtil.getMigrations()).length}\x1b[0m`]
    );
  }
   


  var string = "\n";
  string += `  \x1b[1m++==============================[Avalanche info]==============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Version:\t\t  \x1b[34m\x1b[1mv${avalanchePackage.version}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Directory:\t\t  ${__dirname}\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++===============================[Project info]===============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is NPM project:\t\t  \x1b[33m\x1b[1m${ACUtil.isNodeProject()}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is Avalanche project:\t  \x1b[33m\x1b[1m${ACUtil.isAVAProject()}\x1b[0m\n`;
  if(ACUtil.isAVACoreInstalled()) {
    const version = pkg.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[34m\x1b[1mv${projectVersion}\x1b[0m\n`;
  } else {
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[31m\x1b[1m(NOT INSTALLED)\x1b[0m\n`;
  }
  if(ACUtil.isAVAProject()) {
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${ACUtil.getModels().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${ACUtil.getControllers().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${ACUtil.getRoutes().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${ACUtil.getMiddleware().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${ACUtil.getLocalisations().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${ACUtil.getTranslations().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Helpers:\t\t\t  \x1b[32m\x1b[1m${Object.keys(ACUtil.getHelpers()).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Migrations:\t\t  \x1b[32m\x1b[1m${Object.keys(ACUtil.getMigrations()).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log("\n\n\n");
  console.log("\x1b[32m\x1b[1mAvalanche CLI info\x1b[0m");
  console.log(`${table1.toString()}\n`);
  console.log("\x1b[32m\x1b[1mProject info\x1b[0m");
  console.log(`${table2.toString()}\n`);
}


module.exports.execute = info;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "info";
module.exports.description = "Prints information about your Project.";