const projectPWD = process.env.PWD;
const fs = require("fs");
const md5 = require("md5");
const projectPackage = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


/**
 * @description Checks if the AVACore is installed.
 * @returns {Boolean}
 */
function isAVACoreInstalled() {
  return (projectPackage && projectPackage.dependencies && projectPackage.dependencies.avacore)
}


/**
 * @returns {Boolean}
 */
function isAVAProject() {
  return (projectPackage && typeof projectPackage.avalancheConfig === "object");
}


/**
 * @returns {Boolean}
 */
function isNodeProject() {
  return (typeof projectPackage === "object");
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
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
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


/**
 * @param {String} projectDir 
 * @returns {Object}
 */
function getMigrations(projectDir) {
  const normalizedPath = `${projectDir}/app/migrations`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length = 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        models.push(extensions[0]);
      }
    }
  });
  return models;
}


module.exports = {
    isAVACoreInstalled: isAVACoreInstalled,
    isAVAProject: isAVAProject,
    isNodeProject: isNodeProject,
    directoryLooper: directoryLooper,
    startWatchingSession: startWatchingSession,
    getRoutes: getRoutes,
    getControllers: getControllers,
    getMiddleware: getMiddleware,
    getLocalisations: getLocalisations,
    getTranslations: getTranslations,
    getModels: getModels,
    getHelpers: getHelpers,
    getMigrations: getMigrations
}