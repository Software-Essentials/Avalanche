const fs = require("fs");
const md5 = require("md5");
const projectPackage = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : null;


/**
 * @description Checks if the AVACore is installed.
 * @returns {Boolean}
 */
function isAVACoreInstalled() {
  return (!!projectPackage && !!projectPackage.dependencies && !!projectPackage.dependencies.avacore);
}


/**
 * @returns {Boolean}
 */
function isAVAProject() {
  return (!!projectPackage && typeof projectPackage.avalancheConfig === "object");
}


/**
 * @returns {Boolean}
 */
function isNodeProject() {
  return (typeof projectPackage === "object");
}


/**
 * @returns {String}
 */
function terminalPrefix() {
  return "\x1b[36m\x1b[1m[AVALANCHE]\x1b[0m";
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
 * @returns {Object}
 */
function getRoutes() {
  const normalizedPath = `${projectPWD}/app/routes`;
  var routes = [];
  if (!fs.existsSync(normalizedPath)) {
    return routes;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const route = JSON.parse(JSON.stringify(require(`${projectPWD}/app/routes/${file}`)));
        routes.push.apply(routes, route);
      }
    }
  });
  return routes;
}


/**
 * @returns {Object}
 */
function getControllers() {
  const normalizedPath = `${projectPWD}/app/controllers`;
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


/**
 * @returns {Object}
 */
function getMiddleware() {
  const normalizedPath = `${projectPWD}/app/middleware`;
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


/**
 * @returns {Object}
 */
function getLocalisations() {
  const normalizedPath = `${projectPWD}/app/localisations`;
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


/**
 * @returns {Object}
 */
function getTranslations() {
  const normalizedPath = `${projectPWD}/app/localisations`;
  var translations = [];
  if (!fs.existsSync(normalizedPath)) {
    return translations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        const translationSet = JSON.parse(JSON.stringify(require(`${projectPWD}/app/localisations/${file}`)));
        for (const translation of Object.keys(translationSet)) {
          translations.push(translationSet[translation]);
        }
      }
    }
  });
  return translations;
}


/**
 * @returns {Object}
 */
function getModels() {
  const normalizedPath = `${projectPWD}/app/models`;
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


/**
 * @returns {Object}
 */
function getHelpers(projectPWD) {
  var helpers = {};
  const helpersDirectory = `${projectPWD}/app/helpers`;
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


/**
 * @returns {Object}
 */
function getMigrations() {
  const normalizedPath = `${projectPWD}/app/migrations`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    if (fs.lstatSync(normalizedPath).isFile()) {
      const extensions = file.split(".");
      if (extensions.length = 2) {
        if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
          models.push(extensions[0]);
        }
      }
    }
  });
  return models;
}


/**
 * @returns {Object}
 */
function getSeedFilesNames() {
  const normalizedPath = `${projectPWD}/app/migrations/seeds`;
  var controllers = [];
  if (!fs.existsSync(normalizedPath)) {
    return controllers;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        controllers.push(extensions[0]);
      }
    }
  });
  return controllers;
}


module.exports = {
    isAVACoreInstalled: isAVACoreInstalled,
    isAVAProject: isAVAProject,
    isNodeProject: isNodeProject,
    terminalPrefix: terminalPrefix,
    directoryLooper: directoryLooper,
    startWatchingSession: startWatchingSession,
    getRoutes: getRoutes,
    getControllers: getControllers,
    getMiddleware: getMiddleware,
    getLocalisations: getLocalisations,
    getTranslations: getTranslations,
    getModels: getModels,
    getHelpers: getHelpers,
    getMigrations: getMigrations,
    getSeedFilesNames: getSeedFilesNames
}