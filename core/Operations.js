const projectPWD = process.env.PWD;
const fs = require("fs");
const md5 = require("md5");
const { exec } = require("child_process");
const package = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const avalanchePackage = require("../package.json");
const { AVAError, AVADatabase, AVAEnvironment, Util } = require("../index.js");
const Installer = require("./Installer");
const { COPYFILE_EXCL } = fs.constants;
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
  const path = `${__dirname}/resources/asci`;
  if(fs.existsSync(path)) {
    const file = fs.readFileSync(path, { encoding: "utf8" })
    console.log(`\x1b[36m\x1b[1m${file}\x1b[0m`);
  }
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
  if(Util.getRoutes().length < 1) {
    console.log("\x1b[34m%s\x1b[0m", "[AVALANCHE] (notice) Your app has no routes. (You might want to add some)");
  }
  const environmentName = typeof arguments[0] === "string" ? arguments[0] : null;
  const environment = new AVAEnvironment(environmentName);
  var process = start(environmentName);
  if(environment.restartOnFileChange) {
    const directory = `${projectPWD}/app`;
    const folders = directoryLooper(directory, []).children;
    for(const i in folders) {
      const folder = folders[i];
      if(fs.lstatSync(folder).isDirectory()) {
        const files = fs.readdirSync(folder);
        for(const i in files) {
          const file = files[i];
          const path = `${folder}/${file}`;
          if(fs.lstatSync(path).isFile()) {
            startWatchingSession(path, () => {
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
 * @description Loops to map a full directory structure until it is done.
 * @param {String} filename Name of the directory to map.
 * @param {Object} previousChildren Collection of the results of the previous scan.
 * @returns {Object}
 */
function directoryLooper(filename, previousChildren) {
  var children = previousChildren;
  children.push(filename);
  var stats = fs.lstatSync(filename),
  info = {
    path: filename,
  };
  if (stats.isDirectory()) {
    info.children = fs.readdirSync(filename).map(function(child) {
      const tree = directoryLooper(filename + "/" + child, children);
      return tree.info;
    });
  }

  return { info: info, children: children };
}


/**
 * @description Starts up the server.
 * @param {String} environment 
 */
function start(environment) {
  const environmentFormatted = typeof environment === "string" ? environment.split(" ").join("").trim() : undefined;
  const command = environmentFormatted ? `node core/Main run ${environmentFormatted}` : "node core/Main run";
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
 * @description Will trigger a callback when a change in the given file is detected.
 * @param {String} path Path of the file to start watching.
 * @param {Function} callback Will be triggered when a file change is detected.
 */
function startWatchingSession(path, callback) {  
  let md5Previous = null;
  let fsWait = false;
  fs.watch(path, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100);
      const md5Current = md5(fs.readFileSync(path));
      if (md5Current === md5Previous) {
        return;
      }
      md5Previous = md5Current;
      callback();
    }
  });
}


/**
 * @description Prints all the routes of the current project.
 */
function routes() {
  const routes = Util.getRoutes(projectPWD);
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
    string += `  \x1b[1m||\x1b[0m   Models:\t\t\t  \x1b[32m\x1b[1m${Util.getModels(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Controllers:\t\t  \x1b[32m\x1b[1m${Util.getControllers(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Routes:\t\t\t  \x1b[32m\x1b[1m${Util.getRoutes(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Middleware:\t\t  \x1b[32m\x1b[1m${Util.getMiddleware(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Localisations:\t\t  \x1b[32m\x1b[1m${Util.getLocalisations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Translations:\t\t  \x1b[32m\x1b[1m${Util.getTranslations(projectPWD).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Helpers:\t\t\t  \x1b[32m\x1b[1m${Object.keys(Util.getHelpers(projectPWD)).length}\x1b[0m\n`;
    string += `  \x1b[1m||\x1b[0m   Migrations:\t\t  \x1b[32m\x1b[1m${Object.keys(Util.getMigrations(projectPWD)).length}\x1b[0m\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += `  \x1b[1m++============================================================================\x1b[0m\n`;
  console.log(string);
}


/**
 * @description Migrate.
 */
function migrate() {
  const database = new AVADatabase();
  database.migrate();
}


/**
 * @description Makes controller.
 */
function makeController() {
  const name = "TestController";
  const src = `${__dirname}/../core/components/TEMPLATE_controller`;
  const dest = `${projectPWD}/app/controllers/${name}.js`;

  if(fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest, COPYFILE_EXCL);
    // var file = require(dest);
  }
}


module.exports = {
  fix: fix,
  run: run,
  init: init,
  info: info,
  routes: routes,
  upgrade: upgrade,
  migrate: migrate,
  makeController: makeController
};