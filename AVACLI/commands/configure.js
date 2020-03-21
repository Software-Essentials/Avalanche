import { AFError } from "../../AVAFoundation/index";
import ACInstaller from "../../AVACore/ACInstaller";
import ACUtil, { terminalPrefix, getEnvironments } from "../../AVACore/ACUtil";
import inquirer from "inquirer";
import AFEnvironment from "../../AVAFoundation/AFEnvironment";


/**
 * @description Sets up the project structure
 */
function configure() {
  promptPickEnvironment();
}

function promptPickEnvironment() {
  const choices = getEnvironments();
  const questions = [
    {
      type: "list",
      name: "environment",
      message: "Pick environment",
      default: 0,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      choices: choices
    }
  ];
  inquirer.prompt(questions).then(answers => {
    promptPickSetting(null, answers.environment);
  });
}

function promptPickSetting(existingEnvironment, environmentName) {
  // Lots of string formatting
  const saveString = "\x1b[32m\x1b[1m<< SAVE CHANGES >>";
  const discardString = "\x1b[31m\x1b[1m<< DISCARD CHANGES >>";
  const choiceMap = {};
  const choices = [];
  const environment = existingEnvironment || new AFEnvironment(environmentName);
  const settings = environment.getSettings(true);
  const singleSettings = [];
  var lastDomain = null;
  for (var iterator in settings) {
    iterator = parseInt(iterator);
    const setting = settings[iterator];
    const layers = setting.split(".");
    if (layers.length === 2) {
      singleSettings.push(layers[1]);
    }
  }
  const longestSettingLength = getLongestItem(singleSettings).length;
  for (var iterator in settings) {
    iterator = parseInt(iterator);
    const setting = settings[iterator];
    const layers = setting.split(".");
    if (layers.length === 2) {
      // Check if this is the first item in the domain. If so then first push the domain.
      if (lastDomain !== layers[0]) {
        choices.push(new inquirer.Separator(`\x1b[0m├┐\x1b[2m\x1b[3m${layers[0]}\x1b[0m`));
        lastDomain = layers[0];
      }
      var jointCharacter = "└";
      if ((iterator + 1) < settings.length) {
        const domain = settings[iterator + 1].split(".")[0];
        if (domain === lastDomain) {
          jointCharacter = "├";
        }
      }
      const value = environment[layers[0]][layers[1]];
      const spacedString = `${getSpacedString(longestSettingLength, layers[1].length)}  ${value}`;
      const itemString = `│${jointCharacter}─${layers[1]}${spacedString}`;
      choiceMap[itemString] = setting;
      choices.push(itemString);
    }
  }
  choices.push(saveString);
  choices.push(discardString);
  const questions = [
    {
      type: "list",
      name: "setting",
      message: "Pick domain environment",
      default: 0,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      pageSize: choices.length,
      choices: choices
    }
  ];
  inquirer.prompt(questions).then(answers => {
    if (answers.setting === discardString) {
      console.log(`${terminalPrefix()}\x1b[33m No changes were made.\x1b[0m`);
    } else if (answers.setting === saveString) {
      environment.save();
      console.log(`${terminalPrefix()}\x1b[32m Changes saved to file.\x1b[0m`);
    } else {
      const setting = choiceMap[answers.setting];
      promptEditSetting(environment, setting);
    }
  });
}


function promptEditSetting(environment, setting) {
  const layers = setting.split(".");
  const envSetting = environment[layers[0]][layers[1]];
  const questions = [
    {
      type: "input",
      name: "value",
      message: "Set new value",
      default: envSetting,
      prefix: `${terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
    }
  ];
  inquirer.prompt(questions).then(answers => {
    environment[layers[0]][layers[1]] = answers.value;
    console.log(environment.getSettings());
    promptPickSetting(environment, null);
  });
}

/**
 * @param {[String]} array 
 * @returns {Object} Longest item
 */
function getLongestItem(array) {
  var longest = null;
  for (const item of array) {
    if (item.length > (longest || "").length) {
      longest = item;
    }
  }
  return longest;
}

/**
 * @param {int} space 
 * @param {String} string 
 * @returns {String} Formatted string
 */
function getSpacedString(space, stringLength) {
  var spacedString = "";
  for (let i = 0; i < (space - stringLength); i++) {
    spacedString = " " + spacedString;
  }
  return spacedString;
}


module.exports.execute = configure;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "configure";
module.exports.description = "Addes auth files.";