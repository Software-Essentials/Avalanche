const CoreUtil = require("../CoreUtil");
const fs = require("fs");
const inquirer = require("inquirer");
const { execSync } = require("child_process");
const { AVAError } = require("../../index");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const folders = [
  "/app",
  "/app/controllers",
  "/app/models",
  "/app/environments",
  "/app/localisations",
  "/app/middleware",
  "/app/migrations",
  "/app/migrations/seeds",
  "/app/public",
  "/app/routes",
  "/app/templates",
  "/app/templates/emails",
  "/app/templates/layouts",
  "/app/templates/partials",
  "/app/templates/status",
  "/app/views",
  "/app/helpers"
];


/**
 * @description Sets up the project structure
 */
function init() {
  if(CoreUtil.isAVAProject()) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Project has already been initialized.\x1b[0m`);
    process.exit(AVAError.AVAALREADYINIT);
  }
  installAVACoreIfNeeded();
  const prefab = typeof arguments[0] === "string" ? arguments[0] : null;
  loadBoilerplates(prefab, (boilerplate) => {
    installBoilerplate(boilerplate);
  });
}


/**
 * @description Installs the AVACore if it is not yet installed.
 */
function installAVACoreIfNeeded() {
  if(!CoreUtil.isAVACoreInstalled()) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Installing AVACore\x1b[0m`);
    try {
      execSync("npm install avacore", { windowsHide: true, stdio: "ignore" });
      const dependency = JSON.parse(fs.readFileSync(`${projectPWD}/node_modules/avacore/package.json`));
      if(!package.dependencies) {
        package.dependencies = {};
      }
      package.dependencies["avacore"] = `^${dependency.version}`;
    } catch (error) {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warn) Failed to install avacore. Please install it manually: 'npm install avacore'\x1b[0m`);
    }
  }
}


/**
 * @param {String|null} example 
 * @param {Function} callback 
 */
function loadBoilerplates(example, callback) {
  if(example === null) {
    var choices = [];
    const prefabs = fs.readdirSync(`${__dirname}/../boilerplates`);
    for(const i in prefabs) {
      const prefab = prefabs[i];
      const splitted = prefab.split(".");
      delete splitted[splitted.length - 1];
      choices.push(splitted.join(""));
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
function installBoilerplate(example) {
  console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Building app structure\x1b[0m`);
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  var boilerplate = {};
  const path = `${__dirname}/../boilerplates/${example}.json`;
  if(typeof example === "string" && fs.existsSync(path)) {
    boilerplate = require(path);
    console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Preparing \x1b[3m${example}\x1b[0m\x1b[32m prefabs\x1b[0m`);
  } else {
    if(fs.existsSync(`${__dirname}/../boilerplates/empty.json`)) {
      boilerplate = require(`${__dirname}/../boilerplates/empty.json`);
    } else {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (fatal error) No boilerplates found. You might need to reinstall Avalanche.\x1b[0m`);
      process.exit(AVAError.INCOMPLETECORE);
    }
  }
  for (const folder of boilerplate.folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  for (const file of boilerplate.files) {
    const templatePath = `${__dirname}/../templates/${file.template}`;
    const filePath = `${projectPWD}${file.path}`;
    if (fs.existsSync(templatePath) && !fs.existsSync(filePath)) {
      try {
        fs.copyFileSync(templatePath, filePath, COPYFILE_EXCL);
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) Unable to copy "${file.path}"!\x1b[0m`);
        }
      }
    }
  }
  var file = package;
  file.avalancheConfig = { preferredEnvironment: "development" };
  fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
  const asciiPath = `${__dirname}/../resources/asci`;
  if(fs.existsSync(asciiPath)) {
    const file = fs.readFileSync(asciiPath, { encoding: "utf8" })
    console.log(`\x1b[36m\x1b[1m${file}\x1b[0m`);
  }
  console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Project has been initialized successfully!\x1b[0m`);
}


module.exports = init;