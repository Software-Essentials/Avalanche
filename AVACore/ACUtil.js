import fs from "fs";
import md5 from "md5";
import readline from "readline";


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
  return fs.watch(filePath, (event, filename) => {
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
  // Modulate routing files.
  const normalizedPath = `${projectPWD}/app/routes`;
  var routes = [];
  if (fs.existsSync(normalizedPath)) {
    fs.readdirSync(normalizedPath).forEach((file) => {
      const extensions = file.split(".");
      if (extensions.length === 2) {
        if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
          const route = JSON.parse(JSON.stringify(require(`${projectPWD}/app/routes/${file}`)));
          if (Array.isArray(route)) {
            for (const endpoint of route) {
              endpoint.domains = {};
              endpoint.domains["*"] = {
                controller: endpoint.controller,
                handler: endpoint.handler,
                middleware: endpoint.middleware
              }
            }
            routes.push.apply(routes, route);
          } else {
            if (typeof route === "object" && Array.isArray(route.endpoints)) {
              var domains = ["*"];
              var additionalMiddleware = [];
              if (Array.isArray(route.middleware)) {
                additionalMiddleware = route.middleware;
              }
              if (Array.isArray(route.domains)) {
                domains = route.domains;
              }
              for (let i = 0; i < route.endpoints.length; i++) {
                const endpoint = route.endpoints[i];
                route.endpoints[i].domains = {};
                if (Array.isArray(endpoint.middleware)) {
                  endpoint.middleware.push.apply(endpoint.middleware, additionalMiddleware);
                } else {
                  endpoint.middleware = additionalMiddleware;
                }
                for (const domain of domains) {
                  route.endpoints[i].domains[domain] = {
                    controller: endpoint.controller,
                    handler: endpoint.handler,
                    middleware: endpoint.middleware,
                    file: endpoint.file
                  }
                }
                delete route.endpoints[i].middleware;
                delete route.endpoints[i].controller;
              }
              routes.push.apply(routes, route.endpoints);
            }
            if (typeof route === "object" && typeof route.endpoints === "object" && !Array.isArray(route.endpoints)) {
              var domains = ["*"];
              var additionalMiddleware = [];
              const endpoints = [];
              if (Array.isArray(route.middleware)) {
                additionalMiddleware = route.middleware;
              }
              if (Array.isArray(route.domains)) {
                domains = route.domains;
              }
              for (const navigation of Object.keys(route.endpoints)) {
                const handler = route.endpoints[navigation].split(".");
                const pair = navigation.trim().split(" ");
                const endpoint = {
                  method: pair[0],
                  path: pair[1],
                  domains: {}
                };
                for (const domain of domains) {
                  endpoint.domains[domain] = {
                    controller: handler[0],
                    handler: handler[1],
                    middleware: additionalMiddleware
                  }
                }
                endpoints.push(endpoint);
              }
              routes.push.apply(routes, endpoints);
            }
          }
        }
      }
    });
  }

  // Merge method-path pairs
  for (var i = 0; i < routes.length; i++) {
    const route1 = routes[i];
    for (var j = 0; j < routes.length; j++) {
      const route2 = routes[j];
      if (route1.path === route2.path && route1.method === route2.method) {
        for (const domain of Object.keys(routes[j].domains)) {
          routes[i].domains[domain] = routes[j].domains[domain];
        }
      }
    }
  }
  
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
 * @returns {[String]}
 */
export function getEnvironments() {
  const normalizedPath = `${projectPWD}/app/environments`;
  var environments = [];
  if (!fs.existsSync(normalizedPath)) {
    return environments;
  }
  fs.readdirSync(normalizedPath).forEach((file) => {
    const extensions = file.split(".");
    if (extensions.length === 3) {
      if (extensions[extensions.length - 2].toUpperCase() === "ENVIRONMENT") {
        if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
          environments.push(extensions[0]);
        }
      }
    }
  });
  return environments;
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
  fs.readdirSync(normalizedPath).forEach((file) => {
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
  fs.readdirSync(normalizedPath).forEach((file) => {
    const extensions = file.split(".");
    if (extensions.length === 2) {
      if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
        controllers.push(extensions[0]);
      }
    }
  });
  return controllers;
}

export function progressAnimation(title) {
  var iteration = 0;
  const name = "avalanche";
  var animation;
  if (environment.isTTY()) {
    animation = setInterval(() => {
      var progressBar = "";
      iteration = (iteration + 1) % (name.length + 1);
      for (let i = 0; i < iteration; i++) {
        progressBar += name[i].toUpperCase();
      }
      for (let i = iteration; i < name.length; i++) {
        progressBar += name[i];
      }
      process.stdout.write(`\x1b[36m\x1b[1m[\x1b[34m${progressBar}\x1b[36m]\x1b[0m ${title}\x1b[0m`);
      process.stdout.cursorTo(0);
      // readline.cursorTo(process.stdout, 0);
    }, 100);
  } else {
    animation = setInterval(() => { });
    clearInterval(animation);
    console.log(`${terminalPrefix()}\x1b[0m ${title}...\x1b[0m`);
  }
  return animation;
}


export default null;