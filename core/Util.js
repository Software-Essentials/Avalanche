const fs = require("fs");



/**
 * Creates and formats a UUID from a given string, or generates a new UUID.
 */
function UUID() {
  if(typeof(arguments[0]) === "string" && arguments[0].length === 36 && arguments[0].substring(8, 9) === "-" && arguments[0].substring(13, 14) === "-" && arguments[0].substring(14, 15) === "4" && arguments[0].substring(18, 19) === "-" && arguments[0].substring(23, 24) === "-") {
    this.string = arguments[0].toUpperCase();
  } else {
    var dt = new Date().getTime();
    this.string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r :(r&0x3|0x8)).toString(16);
    }).toUpperCase();
  }
}


/**
 * 
 */
function getOSFromUserAgent(ua) {
  if(ua.includes("Mac OS X")) {
    return "Mac OS X";
  }
  if(ua.includes("Windows")) {
    return "Windows";
  }
  if(ua.includes("iPhone OS")) {
    return "iOS";
  }
  return null;
}


/**
 * 
 */
function getBrowserFromUserAgent(ua) {
  if(ua.includes("Safari")) {
    return "Safari";
  }
  if(ua.includes("Firefox")) {
    return "Firefox";
  }
  if(ua.includes("Chrome")) {
    return "Chrome";
  }
  return null;
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
  UUID: UUID,
  getOSFromUserAgent: getOSFromUserAgent,
  getBrowserFromUserAgent: getBrowserFromUserAgent,
  getRoutes: getRoutes,
  getControllers: getControllers,
  getMiddleware: getMiddleware,
  getLocalisations: getLocalisations,
  getTranslations: getTranslations,
  getModels: getModels,
  getHelpers: getHelpers,
  getMigrations: getMigrations
}
