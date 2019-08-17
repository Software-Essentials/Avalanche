const fs = require("fs");
const CoreUtil = require("../CoreUtil");
const avalanchePackage = require("../../package.json");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Prints information about the current Avalanche version and about the project.
 */
function info() {
  var string = "\n";
  string += `  \x1b[1m++==============================[Avalanche info]==============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Version:\t\t  \x1b[34m\x1b[1mv${avalanchePackage.version}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Directory:\t\t  ${__dirname}\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++===============================[Project info]===============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is NPM project:\t\t  \x1b[33m\x1b[1m${CoreUtil.isNodeProject()}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is Alanche project:\t  \x1b[33m\x1b[1m${CoreUtil.isAVAProject()}\x1b[0m\n`;
  if(CoreUtil.isAVACoreInstalled()) {
    const version = package.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[34m\x1b[1mv${projectVersion}\x1b[0m\n`;
  } else {
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[31m\x1b[1m(NOT INSTALLED)\x1b[0m\n`;
  }
  if(CoreUtil.isAVAProject()) {
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${CoreUtil.getModels().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${CoreUtil.getControllers().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${CoreUtil.getRoutes().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${CoreUtil.getMiddleware().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${CoreUtil.getLocalisations().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${CoreUtil.getTranslations().length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Helpers:\t\t\t  \x1b[32m\x1b[1m${Object.keys(CoreUtil.getHelpers()).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Migrations:\t\t  \x1b[32m\x1b[1m${Object.keys(CoreUtil.getMigrations()).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log(string);
}


module.exports = info;