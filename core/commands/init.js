const CoreUtil = require("../CoreUtil");
const fs = require("fs");
const inquirer = require("inquirer");
const { exec } = require("child_process");
const { AVAError } = require("../../index");
const Installer = require("../Installer");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Sets up the project structure
 */
function init() {
  if(CoreUtil.isAVAProject()) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Project has already been initialized.\x1b[0m`);
    process.exit(AVAError.AVAALREADYINIT);
  } else {
    installAVACoreIfNeeded(() => {
      const prefab = typeof arguments[0] === "string" ? arguments[0] : null;
      loadBoilerplates(prefab, (boilerplate) => {
        installBoilerplate(boilerplate);
      });
    });
  }
}


/**
 * @description Installs the AVACore if it is not yet installed.
 */
function installAVACoreIfNeeded() {
  const ready = typeof arguments[0] === "function" ? arguments[0] : () => {};
  if(!CoreUtil.isAVACoreInstalled()) {
    process.stdout.clearLine();
    var i = 0, total = 10;
    const animation = setInterval(() => {
      process.stdout.clearLine();
      i = (i + 1) % total;
      const r = total - i;
      var dots = "{ " + new Array(i + 1).join("=") + ">" + (new Array(r).join(" ")) + " [=] }";
      process.stdout.write(`${CoreUtil.terminalPrefix()}\x1b[32m Downloading AVACore ${dots}\x1b[0m`)
      process.stdout.cursorTo(0);
    }, 50);
    const iProcess = exec("npm install avacore", (error, stout, sterr) => {});
    iProcess.on("error", (error) => {
      clearInterval(animation);
      console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warn) Failed to install avacore. Please install it manually: 'npm install avacore'\x1b[0m`);
    });
    iProcess.on("exit", (code, signal) => {
      clearInterval(animation);
      process.stdout.clearLine();
      process.stdout.write(`\n${CoreUtil.terminalPrefix()}\x1b[32m AVACore Installed!\x1b[0m`)
      const dependency = JSON.parse(fs.readFileSync(`${projectPWD}/node_modules/avacore/package.json`));
      if(!package.dependencies) {
        package.dependencies = {};
      }
      package.dependencies["avacore"] = `^${dependency.version}`;
      ready();
    });
  } else {
    ready();
  }
}


/**
 * @param {String|null} example 
 * @param {Function} callback 
 */
function loadBoilerplates(example, callback) {
  if(example === null) {
    var choices = [];
    const path = `${__dirname}/../installs`;
    const prefabs = fs.readdirSync(path);
    for(const i in prefabs) {
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
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
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
    var file = package;
    file.avalancheConfig = { preferredEnvironment: "development" };
    fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
    const asciiPath = `${__dirname}/../resources/asci`;
    if(fs.existsSync(asciiPath)) {
      const file = fs.readFileSync(asciiPath, { encoding: "utf8" })
      console.log(`\x1b[36m\x1b[1m${file}\x1b[0m`);
    }
    console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Project has been initialized successfully!\x1b[0m`);
  };
  const onFailure = ({error, message}) => {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m ${message}\x1b[0m`);
    process.exit(AVAError.INCOMPLETECORE);
  };
  const installer = new Installer();
  installer.install({package: packageName, onSuccess, onFailure});
}


module.exports.execute = init;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "init";
module.exports.description = "Initializes your Project.";