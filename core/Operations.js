const projectPWD = process.env.PWD;
const fs = require("fs");
const inquirer = require("inquirer");
const { exec, execSync } = require("child_process");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError, AVADatabase, AVAEnvironment, Util } = require("../index.js");
const { COPYFILE_EXCL } = fs.constants;
const CoreUtil = require("./CoreUtil");
const folders = [
  "/app",
  "/app/controllers",
  "/app/models",
  "/app/environments",
  "/app/localisations",
  "/app/middleware",
  "/app/migrations",
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
    console.log(`\x1b[31m[AVALANCHE] (error) Project has already been initialized.\x1b[0m`);
    process.exit(AVAError.AVAALREADYINIT);
  }
  installAVACoreIfNeeded();
  const prefab = typeof arguments[0] === "string" ? arguments[0] : null;
  loadBoilerplates(prefab, (boilerplate) => {
    installBoilerplate(boilerplate);
  });
}


/**
 * @param {String|null} example 
 * @param {Function} callback 
 */
function loadBoilerplates(example, callback) {
  if(example === null) {
    var choices = [];
    const prefabs = fs.readdirSync(`${__dirname}/prefabs`);
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
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
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
  console.log(`\x1b[32m[AVALANCHE] Building app structure\x1b[0m`);
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  var files = [];
  if(typeof example === "string" && fs.existsSync(`${__dirname}/prefabs/${example}.json`)) {
    files = require(`${__dirname}/prefabs/${example}.json`);
    console.log(`\x1b[32m[AVALANCHE] Preparing \x1b[3m${example}\x1b[0m\x1b[32m prefabs\x1b[0m`);
  } else {
    if(fs.existsSync(`${__dirname}/prefabs/empty.json`)) {
      files = require(`${__dirname}/prefabs/empty.json`);
    } else {
      console.log(`\x1b[31m[AVALANCHE] (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
      process.exit(AVAError.INCOMPLETECORE);
    }
  }
  for (const file of files) {
    const src = `${__dirname}/templates/${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
    }
  }
  var file = package;
  file.avalancheConfig = { preferredEnvironment: "development" };
  fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
  const path = `${__dirname}/resources/asci`;
  if(fs.existsSync(path)) {
    const file = fs.readFileSync(path, { encoding: "utf8" })
    console.log(`\x1b[36m\x1b[1m${file}\x1b[0m`);
  }
  console.log(`\x1b[32m[AVALANCHE] Project has been initialized successfully!\x1b[0m`);
}


/**
 * @description Installs the AVACore if it is not yet installed.
 */
function installAVACoreIfNeeded() {
  if(!CoreUtil.isAVACoreInstalled()) {
    console.log(`\x1b[32m[AVALANCHE] Installing AVACore\x1b[0m`);
    try {
      execSync("npm install avacore", { windowsHide: true, stdio: "ignore" });
      const dependency = JSON.parse(fs.readFileSync(`${projectPWD}/node_modules/avacore/package.json`));
      if(!package.dependencies) {
        package.dependencies = {};
      }
      package.dependencies["avacore"] = `^${dependency.version}`;
    } catch (error) {
      console.log(`\x1b[33m[AVALANCHE] (warn) Failed to install avacore. Please install it manually: 'npm install avacore'\x1b[0m`);
    }
  }
}


/**
 * @description Fixes the project structure
 */
function config() {
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Fixing project...");
  var fixedStructure = false;
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
      fixedStructure = true;
    }
  }
  for (const file of files) {
    const src = `${__dirname}/templates/${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest) && file.standard === true) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
      fixedStructure = true;
    }
  }
  if(fixedStructure) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Restored project structure");
  }
}


/**
 * @description Runs your Avalanche application.
 */
function run() {
  if(CoreUtil.getRoutes().length < 1) {
    console.log("\x1b[34m%s\x1b[0m", "[AVALANCHE] (notice) Your app has no routes. (You might want to add some)");
  }
  const environmentName = typeof arguments[0] === "string" ? arguments[0] : null;
  const environment = new AVAEnvironment(environmentName);
  var process = start(environmentName);
  if(environment.restartOnFileChange) {
    const directory = `${projectPWD}/app`;
    const folders = CoreUtil.directoryLooper(directory, []).children;
    for(const i in folders) {
      const folder = folders[i];
      if(fs.lstatSync(folder).isDirectory()) {
        const files = fs.readdirSync(folder);
        for(const i in files) {
          const file = files[i];
          const path = `${folder}/${file}`;
          if(fs.lstatSync(path).isFile()) {
            CoreUtil.startWatchingSession(path, () => {
              process.kill("SIGINT");
              process = start(environmentName);
            });
          }
        }
      }
    }
  }
}


/**
 * @description Starts up the server.
 * @param {String} environment 
 */
function start(environment) {
  const environmentFormatted = typeof environment === "string" ? environment.split(" ").join("").trim() : undefined;
  const command = environmentFormatted ? `node ${__dirname}/Main run ${environmentFormatted}` : `node ${__dirname}/Main run`;
  const process = exec(command, (error, stdout, stderr) => {
    if(error) {
      if(error.signal === "SIGINT") {
        return;
      }
      console.log("ERROR:", error);
    }
  });
  process.stdout.on("data", (data) => {
    console.log(data.toString().trim());
  });
  process.stderr.on("data", (data) => {
    console.log(data.toString().trim());
  });
  process.on("exit", (code) => {
    console.log(`\x1b[31m[AVALANCHE] Server stopped.\x1b[0m`);
  });
  return process;
}


/**
 * @description Prints all the routes of the current project.
 */
function routes() {
  const routes = CoreUtil.getRoutes(projectPWD);
  if(routes.length <= 0) {
    console.log(`\x1b[32m[AVALANCHE] Can't show routes because there aren't any routes in the project.\x1b[0m`);
    return;
  }
  var string = "\n  \x1b[1m++======================================================================\x1b[0m\n";
  string += `  \x1b[1m||\x1b[0m\n`;
  for (const route of routes) {
    const path = route.path;
    const method = route.method;
    const controller = route.controller;
    const handler = typeof route.handler === "string" ? route.handler : null;
    const color =
      method === "GET" ? 32 :
      method === "POST" ? 33 :
      method === "PUT" ? 34 :
      method === "DELETE" ? 31 : 0
    string += `  \x1b[1m||\x1b[0m  [\x1b[${color}m\x1b[1m${method}\x1b[0m] \t \x1b[3m${path}\x1b[0m\t        \x1b[32m${controller}\x1b[0m${handler ? `.\x1b[33m${handler}\x1b[0m()` : ".\x1b[34mconstructor\x1b[0m" }\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += "  \x1b[1m++======================================================================\x1b[0m\n";
  console.log(string);
}


/**
 * @description Makes all changes nescesary for compatibility with the next Avalanche version.
 */
function upgrade() {
  // Upgrade patterns not yet implemented.
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Checking for update...");
  console.log("\x1b[31m%s\x1b[0m", "[AVALANCHE] (error) No upgrade pattern found. Check the GitHub Wiki for more information.");
}


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
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${CoreUtil.getModels(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${CoreUtil.getControllers(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${CoreUtil.getRoutes(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${CoreUtil.getMiddleware(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${CoreUtil.getLocalisations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${CoreUtil.getTranslations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Helpers:\t\t\t  \x1b[32m\x1b[1m${Object.keys(CoreUtil.getHelpers(projectPWD)).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Migrations:\t\t  \x1b[32m\x1b[1m${Object.keys(CoreUtil.getMigrations(projectPWD)).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log(string);
}


/**
 * @description Migrate.
 */
function migrate() {
  // const database = new AVADatabase();
  // database.migrate();

  const questions = [
    {
      type: "list",
      name: "method",
      message: "Choose a migration mode:",
      default: 0,
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m",
      choices: [
        "\x1b[32m\x1b[1mSAFE\x1b[0m \x1b[3m(Only migrates zones/tables that don't exist yet)\x1b[0m",
        "\x1b[33m\x1b[1mOVERWRITE\x1b[0m \x1b[3m(Migrates over your existing zones/tables)\x1b[0m",
        "\x1b[31m\x1b[1mWIPE\x1b[0m \x1b[3m(Wipes your storage/database and then migrates)\x1b[0m"
      ]
    }
  ];
  inquirer.prompt(questions).then(answers => {
    console.log(`\x1b[31m[AVALANCHE] (error)\x1b[0m`);
  });
}


/**
 * @description Makes controller.
 */
function make(component) {
  // if(typeof name !== "string") {
  //   console.log(`\x1b[31m[AVALANCHE] (error) Please specify a name!\x1b[0m`);
  //   return;
  // }
  switch(component) {
    case "controller":
      make_controller();
      return;
    case "view":
      make_view();
      return;
    case "model":
      make_model();
      return;
    default:
      make_default();
      return;
  }
}


/**
 * 
 */
function make_controller() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your controller:",
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(!answer.endsWith("Controller"))
          return `\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`;
        if(fs.existsSync(`${projectPWD}/app/controllers/${answer}.js`))
          return "\x1b[31mA controller with this name already exists.\x1b[0m";
        return true;
      }
    }//,
    // {
    //   type: "checkbox",
    //   name: "actions",
    //   message: "Choose what actions you want:",
    //   choices: [
    //     "index",
    //     "show",
    //     "store",
    //     "update",
    //     "destroy"
    //   ],
    //   default: [
    //     "index",
    //     "show",
    //     "store",
    //     "update",
    //     "destroy"
    //   ],
    //   prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
    //   suffix: "\x1b[0m"
    // },
    // {
    //   type: "list",
    //   name: "routes",
    //   message: "Do you want to automaticly generate routes?",
    //   choices: ["Add to existing routes file", "Create new routes file", "Don't generate routes"],
    //   prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
    //   suffix: "\x1b[0m"
    // }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/controllers/${answers.name}.js`;
    const template = "TEMPLATE_controller";
    const variables = { name: answers.name };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_view() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your view:",
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(!answer.endsWith("ViewController"))
          return `\x1b[31mA voew name should end with "ViewController". For example: "ProfileViewController".\x1b[0m`;
        if(fs.existsSync(`${projectPWD}/app/views/${answer}.js`))
          return "\x1b[31mA view with this name already exists.\x1b[0m";
        return true;
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/views/${answers.name}.js`;
    const template = "TEMPLATE_view";
    const variables = { name: answers.name };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_model() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your model:",
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/models/${answer}.js`))
          return "\x1b[31mA model with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "input",
      name: "table",
      choices: ["AVAStorage", "AVADatabase"],
      message: "Name your zone/table:",
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m",
      default: (answers) => {
        return answers.name;
      },
      validate: (answer) => {
        return answer.length <= 1 ? true : "Model name should be atleast 2 characters";
      }
    },
    {
      type: "list",
      name: "method",
      choices: ["AVAStorage", "AVADatabase"],
      message: "Choose a storage method:",
      prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/models/${answers.name}.js`;
    const template = "TEMPLATE_model";
    const variables = {
      name: answers.name,
      name_lower: answers.name.toLowerCase()
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_default() {
  var choices = [
    "controller",
    "model",
    "view"
  ];
  const prompt = {
    type: "list",
    name: "component",
    message: "What would you like to make?",
    default: 0,
    choices: choices,
    prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
    suffix: "\x1b[0m"
  };
  inquirer.prompt(prompt).then(answers => {
    make(answers.component);
    return;
  });
}


/**
 * @description Renders the template file.
 * @param {Object} variables 
 * @param {String} template 
 * @param {String} path 
 */
function makeTemplate(variables, template, path) {
  const src = `${__dirname}/templates/${template}`;
  const dest = `${projectPWD}/${path}`;
  if(fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
      var content = fs.readFileSync(dest).toString();
      for(const key in variables) {
        const variable = variables[key];
        content = content.split(`<#${key}?>`).join(variable);
      }
      fs.writeFileSync(dest, content, { encoding: "utf8" });
      console.log(`\x1b[32m[AVALANCHE] Done.\x1b[0m`);
    } else {
      console.log(`\x1b[31m[AVALANCHE] (error) This file already exists!\x1b[0m`);
    }
  } else {
    console.log(`\x1b[31m[AVALANCHE] (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
    process.exit(AVAError.INCOMPLETECORE);
  }
}


module.exports = {
  config: config,
  run: run,
  init: init,
  info: info,
  make: make,
  routes: routes,
  upgrade: upgrade,
  migrate: migrate
};