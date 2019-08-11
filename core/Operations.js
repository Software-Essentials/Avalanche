const projectPWD = process.env.PWD;
const fs = require("fs");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError } = require("../index.js");
const Installer = require("./Installer");

const { COPYFILE_EXCL } = fs.constants;
const folders = [
  "/app",
  "/app/controllers",
  "/app/models",
  "/app/environments",
  "/app/localisations",
  "/app/middleware",
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
  if(typeof package.avalancheConfig === "object") {
    console.log(`\x1b[31m[AVALANCHE] (error) Project has already been initialized.\x1b[0m`);
    process.exit(AVAError.prototype.AVAALREADYINIT);
  }
  console.log(`\x1b[32m[AVALANCHE] Installing AVACore\x1b[0m`);
  Installer("avacore", (error) => {
    if (error) {
      console.log(`\x1b[33m[AVALANCHE] (warn) Failed to install avacore. Please install it manually: 'npm install avacore'\x1b[0m`);
    }
  });
  console.log(`\x1b[32m[AVALANCHE] Building app structure\x1b[0m`);
  const example = typeof arguments[0] === "string" ? arguments[0] : null;
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
    if(fs.existsSync(`${__dirname}/prefabs/default.json`)) {
      files = require(`${__dirname}/prefabs/default.json`);
    } else {
      console.log(`\x1b[31m[AVALANCHE] (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
      process.exit(AVAError.prototype.INCOMPLETECORE);
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
  console.log(`\x1b[32m[AVALANCHE] Project has been initialized successfully!\x1b[0m`);
}

/**
 * @description Fixes the project structure
 */
function fix() {
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
  const environment = typeof arguments[0] === "string" ? arguments[0] : null;
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Starting server...`);
  require("./Main.js").run(environment);
}

/**
 * @description Prints all the routes of the current project.
 */
function routes() {
  const routes = getRoutes(projectPWD);
  if(routes.length <= 0) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Can't show routes because there aren't any routes in the project.");
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
  const isNodeProject = typeof package === "object";
  var isAvalancheProject = isNodeProject ? typeof package.avalancheConfig === "object" : false;

  var string = "\n";
  string += `  \x1b[1m++==============================[Avalanche info]==============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Version:\t\t  \x1b[34m\x1b[1mv${avalanchePackage.version}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   CLI Directory:\t\t  ${__dirname}\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++===============================[Project info]===============================\n`;
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is NPM project:\t\t  \x1b[33m\x1b[1m${isNodeProject}\x1b[0m\n`;
  string += `  \x1b[1m||\x1b[0m   Is Alanche project:\t  \x1b[33m\x1b[1m${isAvalancheProject}\x1b[0m\n`;
  if(package.dependencies && package.dependencies.avacore) {
    const version = package.dependencies.avacore;
    const projectVersion = version.substring(0, 1) === "^" ? version.substring(1) : version;
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[34m\x1b[1mv${projectVersion}\x1b[0m\n`;
  } else {
    string += `  \x1b[1m||\x1b[0m   AVACore version:\t\t  \x1b[31m\x1b[1m(NOT INSTALLED)\x1b[0m\n`;
  }
  if(isAvalancheProject) {
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${getModels(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${getControllers(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${getRoutes(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${getMiddleware(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${getLocalisations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${getTranslations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Helpers:\t\t\t  \x1b[32m\x1b[1m${Object.keys(getHelpers(projectPWD)).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log(string);
}


function makeController() {
  const name = "TestController";
  const src = `${__dirname}/../core/components/TEMPLATE_controller`;
  const dest = `${projectPWD}/app/controllers/${name}.js`;

  if(fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest, COPYFILE_EXCL);
    // var file = require(dest);
  }
}

function getRoutes(projectDir) {
  const normalizedPath = `${projectDir}/app/routes`;
  var routes = [];
  if (!fs.existsSync(normalizedPath)) {
    return routes;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const route = JSON.parse(JSON.stringify(require(`${projectDir}/app/routes/${file}`)));
        routes.push.apply(routes, route);
      }
    }
  });
  return routes;
}

function getControllers(projectDir) {
  const normalizedPath = `${projectDir}/app/controllers`;
  var controllers = [];
  if (!fs.existsSync(normalizedPath)) {
    return controllers;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        controllers.push(extensions[0]);
      }
    }
  });
  return controllers;
}

function getMiddleware(projectDir) {
  const normalizedPath = `${projectDir}/app/middleware`;
  var middleware = [];
  if (!fs.existsSync(normalizedPath)) {
    return middleware;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        middleware.push(extensions[0]);
      }
    }
  });
  return middleware;
}

function getLocalisations(projectDir) {
  const normalizedPath = `${projectDir}/app/localisations`;
  var localisations = [];
  if (!fs.existsSync(normalizedPath)) {
    return localisations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        localisations.push(extensions[0]);
      }
    }
  });
  return localisations;
}

function getTranslations(projectDir) {
  const normalizedPath = `${projectDir}/app/localisations`;
  var translations = [];
  if (!fs.existsSync(normalizedPath)) {
    return translations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const translationSet = JSON.parse(JSON.stringify(require(`${projectDir}/app/localisations/${file}`)));
        for (const translation of Object.keys(translationSet)) {
          translations.push(translationSet[translation]);
        }
      }
    }
  });
  return translations;
}

function getModels(projectDir) {
  const normalizedPath = `${projectDir}/app/models`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JS") {
        models.push(extensions[0]);
      }
    }
  });
  return models;
}

function getHelpers(projectDir) {
  var helpers = {};
  const helpersDirectory = `${projectDir}/app/helpers`;
  if(fs.existsSync(helpersDirectory)) {
    const dir = fs.readdirSync(helpersDirectory);
    for (const file of dir) {
      if(fs.existsSync(`${helpersDirectory}/${file}`)) {
        const helpersInFile = require(`${helpersDirectory}/${file}`);
        const keys = Object.keys(helpersInFile);
        for (const key of keys) {
          helpers[key] = helpersInFile[key];
        }
      }
    }
  }
  return helpers;
}

module.exports = {
  fix: fix,
  run: run,
  init: init,
  info: info,
  routes: routes,
  upgrade: upgrade,
  makeController: makeController
};