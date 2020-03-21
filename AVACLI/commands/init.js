import fs from "fs";
import inquirer from "inquirer";
import { exec, execSync } from "child_process";
import ACInstaller from "../../AVACore/ACInstaller";
import { AFError } from "../../AVAFoundation/index";
import * as ACUtil from "../../AVACore/ACUtil";

var npmPackage = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Sets up the project structure
 */
function init() {
  if (ACUtil.isAVAProject()) {
    console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) Project has already been initialized.\x1b[0m`);
    process.exit(AFError.AVAALREADYINIT);
  } else {
    initNPMIfNeeded();
    npmPackage = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
    installAVACoreIfNeeded(() => {
      const prefab = typeof arguments[0] === "string" ? arguments[0] : null;
      loadBoilerplates(prefab, (boilerplate) => {
        installBoilerplate(boilerplate);
      });
    });
  }
}

function initNPMIfNeeded() {
  if (!fs.existsSync(`${projectPWD}/package.json`)) {
    process.stdout.write(`${ACUtil.terminalPrefix()}\x1b[32m NPM setup...\x1b[0m`);
    process.stdout.clearLine();
    try {
      execSync("npm init -y", { windowsHide: true, stdio: "ignore" });
    } catch (error) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[33m (fatal error) Failed to setup NPM project. Is NPM not installed on your machine? Do you need to update NPM? is NPM broken? What's going on?!? :O\x1b[0m`);
    }
  }
}

/**
 * @description Installs the AVACore if it is not yet installed.
 */
function installAVACoreIfNeeded() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => { };
  if (!ACUtil.isAVACoreInstalled()) {
    process.stdout.clearLine();
    const animation = progressAnimation("Downloading AVACore");
    const iProcess = exec("npm install avacore", (error, stout, sterr) => { });
    iProcess.on("error", (error) => {
      clearInterval(animation);
      console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warn) Failed to install avacore. Please install it manually: 'npm install avacore'\x1b[0m`);
    });
    iProcess.on("exit", (code, signal) => {
      clearInterval(animation);
      process.stdout.clearLine();
      process.stdout.write(`\n${ACUtil.terminalPrefix()}\x1b[32m AVACore Installed!\n\x1b[0m`)
      const dependency = JSON.parse(fs.readFileSync(`${projectPWD}/node_modules/avacore/package.json`));
      if (!npmPackage.dependencies) {
        npmPackage.dependencies = {};
      }
      npmPackage.dependencies["avacore"] = `^${dependency.version}`;
      ready();
    });
  } else {
    ready();
  }
}

function progressAnimation(title) {
  var i = 0, total = 10;
  return setInterval(() => {
    process.stdout.clearLine();
    i = (i + 1) % total;
    const r = total - i;
    var dots = "〈" + new Array(i + 1).join("◼︎") + (new Array(r).join(" ")) + "〉";
    process.stdout.write(`${ACUtil.terminalPrefix()}\x1b[32m ${title} ${dots}\x1b[0m`);
    process.stdout.cursorTo(0);
  }, 50);
}


/**
 * @param {String|null} example 
 * @param {Function} callback 
 */
function loadBoilerplates(example, callback) {
  if (example === null) {
    var choices = [];
    const path = `${__dirname}/../../AVACore/installs`;
    const prefabs = fs.readdirSync(path);
    for (const i in prefabs) {
      const prefab = prefabs[i];
      const splitted = prefab.split(".");
      delete splitted[splitted.length - 1];
      const content = require(`${path}/${prefab}`);
      if (content.type === "BOILERPLATE") {
        choices.push(splitted.join(""));
      }
    }
    const prompt = {
      type: "list",
      name: "boilerplate",
      message: "Choose your boilerplate:",
      default: 0,
      choices: choices,
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m"
    };
    inquirer.prompt(prompt).then(answers => {
      callback(answers.boilerplate);
    });
  } else {
    callback(example);
  }
}


/**
 */
function installBoilerplate(packageName) {
  const onSuccess = () => {
    var file = npmPackage;
    file.avalancheConfig = { preferredEnvironment: "development" };
    fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
    const asciiPath = `${__dirname}/../../AVACore/resources/asci`;
    if (fs.existsSync(asciiPath)) {
      const file = fs.readFileSync(asciiPath, { encoding: "utf8" })
      console.log(`\x1b[36m\x1b[1m${file}\x1b[0m`);
    }
    console.log(`${ACUtil.terminalPrefix()}\x1b[32m Project has been initialized successfully!\x1b[0m`);
  };
  const onFailure = ({ error, message }) => {
    console.log(`${ACUtil.terminalPrefix()}\x1b[31m ${message}\x1b[0m`);
    process.exit(AFError.INCOMPLETECORE);
  };
  const installer = new ACInstaller();
  installer.install({ package: packageName, onSuccess, onFailure });
}


module.exports.execute = init;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "GLOBAL";
module.exports.command = "init";
module.exports.description = "Initializes your Avalanche Project.";