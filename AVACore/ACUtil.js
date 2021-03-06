import fs from "fs";
import md5 from "md5";


/**
 * 
 *  This file should contain all utility functions that can only be used by classes in the AVACore package
 * 
 */


/**
 * @description Checks if the AVACore is installed.
 * @returns {Boolean}
 */
export function isAVACoreInstalled() {
  const projectPackage = getProjectPackage();
  return (!!projectPackage && !!projectPackage.dependencies && !!projectPackage.dependencies.avacore);
}


/**
 * @returns {Boolean}
 */
export function isAVAProject() {
  const projectPackage = getProjectPackage();
  return (!!projectPackage && typeof projectPackage.avalancheConfig === "object");
}


/**
 * @returns {Boolean}
 */
export function isNodeProject() {
  return fs.existsSync(`${projectPWD}/package.json`);
}


/**
 * @returns {String}
 */
export function terminalPrefix() {
  return "\x1b[36m\x1b[1m[AVALANCHE]\x1b[0m";
}


/**
 * @description Returns the package.json if it exsists.
 * @returns {Object|null}
 */
export function getProjectPackage() {
  return fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : null;
}


/**
 * @description Will trigger a callback when a change in the given file is detected.
 * @param {String} filePath Path of the file to start watching.
 * @param {Function} callback Will be triggered when a file change is detected.
 */
export function startWatchingSession(filePath, callback) {
  let md5Previous = null;
  let fsWait = false;
  fs.watch(filePath, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100);
      if (fs.existsSync(filePath)) {
        const md5Current = md5(fs.readFileSync(filePath));
        if (md5Current === md5Previous) {
          return;
        }
        md5Previous = md5Current;
      }
      callback();
    }
  });
}


/**
 * @returns {Object}
 */
export function getRoutes() {
  const normalizedPath = `${projectPWD}/app/routes`;
  var routes = [];
  if (!fs.existsSync(normalizedPath)) {
    return routes;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getControllers() {
  const normalizedPath = `${projectPWD}/app/controllers`;
  var controllers = [];
  if (!fs.existsSync(normalizedPath)) {
    return controllers;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getMiddleware() {
  const normalizedPath = `${projectPWD}/app/middleware`;
  var middleware = [];
  if (!fs.existsSync(normalizedPath)) {
    return middleware;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getLocalisations() {
  const normalizedPath = `${projectPWD}/app/localisations`;
  var localisations = [];
  if (!fs.existsSync(normalizedPath)) {
    return localisations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getTranslations() {
  const normalizedPath = `${projectPWD}/app/localisations`;
  var translations = [];
  if (!fs.existsSync(normalizedPath)) {
    return translations;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getModels() {
  const normalizedPath = `${projectPWD}/app/models`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
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
export function getHelpers(projectPWD) {
  var helpers = {};
  const helpersDirectory = `${projectPWD}/app/helpers`;
  if (fs.existsSync(helpersDirectory)) {
    const dir = fs.readdirSync(helpersDirectory);
    for (const file of dir) {
      if (fs.existsSync(`${helpersDirectory}/${file}`)) {
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
export function getMigrations() {
  const normalizedPath = `${projectPWD}/app/migration`;
  var models = [];
  if (!fs.existsSync(normalizedPath)) {
    return models;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    if (fs.lstatSync(normalizedPath).isFile()) {
      const extensions = file.split(".");
      if (extensions.length === 2) {
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
export function getSeedFilesNames() {
  const normalizedPath = `${projectPWD}/app/migration/seeds`;
  var controllers = [];
  if (!fs.existsSync(normalizedPath)) {
    return controllers;
  }
  fs.readdirSync(normalizedPath).forEach(function (file) {
    const extensions = file.split(".");
    if (extensions.length === 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        controllers.push(extensions[0]);
      }
    }
  });
  return controllers;
}


export default null;