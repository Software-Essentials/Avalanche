import fs from "fs";
import AFError from "../AVAFoundation/AFError";
import * as ACUtil from "../AVACore/ACUtil";
import { UUID } from "./AFUtil";

const packageConfig = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const DB_STORE_OPTIONS = [
  "MYSQL"
];


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFEnvironment {

  constructor() {

    var normalizedPath = `${projectPWD}/app/environments`;
    var environments = [];
    var selectedEnvironment = null;
    var selectedEnvironmentKey = null;
    if (fs.existsSync(normalizedPath)) {
      fs.readdirSync(normalizedPath).forEach(function (file) {
        const extensions = file.split(".");
        if (extensions.length === 3)
          if (extensions[extensions.length - 1].toUpperCase() === "JSON")
            if (extensions[extensions.length - 2].toUpperCase() === "ENVIRONMENT")
              environments[extensions[0]] = require(`${projectPWD}/app/environments/${file}`);
      });
    }

    if (Object.keys(environments).length <= 0) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment file missing!\x1b[0m`);
      process.exit(AFError.NOENV);
    }

    var prefferedEnvironmentLoaded = false;
    const environmentKeys = Object.keys(environments);
    for (var i = 0; i < environmentKeys.length; i++) {
      const environmentKey = environmentKeys[i];
      const environment = environments[environmentKey];
      selectedEnvironment = environment;
      selectedEnvironmentKey = environmentKey;
      if (typeof arguments[0] === "string") {
        if (environmentKey === arguments[0]) {
          this.loadEnvironment(selectedEnvironment);
          prefferedEnvironmentLoaded = true;
          this._NAME = environmentKey;
          break;
        }
      } else {
        if (environmentKey === packageConfig.avalancheConfig.preferredEnvironment) {
          this.loadEnvironment(selectedEnvironment);
          prefferedEnvironmentLoaded = true;
          this._NAME = environmentKey;
          break;
        }
      }
    }
    if (!prefferedEnvironmentLoaded) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): Preffered environment not found; defaulting to "${selectedEnvironmentKey}".\x1b[0m`);
      this.loadEnvironment(selectedEnvironment);
      this._NAME = selectedEnvironment;
    }
  }

  getFullURL() {
    const fullURL = (this.isUsingSSL ? "https://" : "http://") + (this.domain) + (this.isUsingSSL ? "" : (this.port === 80 ? "" : ":" + this.port));
    return fullURL;
  }

  save() {
    const environment = JSON.parse(JSON.stringify(this));
    const environmentName = environment._NAME;
    // Prune environment object
    delete environment._NAME;
    delete environment.title;
    delete environment.version;
    delete environment.description;
    delete environment.domain;
    delete environment.host;
    delete environment.port;
    var normalizedPath = `${projectPWD}/app/environments/${environmentName}.environment.json`;
    const results = fs.writeFileSync(normalizedPath, JSON.stringify(environment, null, 2));
    console.log(results);
  }

  getSettings() {
    const environment = JSON.parse(JSON.stringify(this));
    if (arguments[0] === true) { // Flat
      const flatEnvironment = this.getSettings();
      for (const domain of Object.keys(environment)) {
        if (typeof environment[domain] === "object") {
          for (const key of Object.keys(environment[domain])) {
            flatEnvironment[`${domain}.${key}`] = environment[domain][key];
          }
          delete flatEnvironment[domain];
        }
      }
      return Object.keys(flatEnvironment);
    } else {
      // Prune environment object
      delete environment.title;
      delete environment.version;
      delete environment.description;
      delete environment.domain;
      delete environment.host;
      delete environment.port;
    }
    return environment;
  }

  loadEnvironment(env) {
    var isValid = true;

    this.network = {};
    if (typeof (env.network) === "object") {
      if (typeof (env.network.domain) === "string") {
        this.domain = env.network.domain; // DEPRECATED
        this.network.domain = env.network.domain;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No domain specified; defaulting to 'localhost'.\x1b[0m`);
        this.domain = "localhost"; // DEPRECATED
        this.network.domain = "localhost";
      }
      if (typeof (env.network.host) === "string") {
        this.host = env.network.host; // DEPRECATED
        this.network.host = env.network.host;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No host specified; defaulting to '127.0.0.1'.\x1b[0m`);
        this.host = "127.0.0.1"; // DEPRECATED
        this.network.host = "127.0.0.1";
      }
      if (typeof (env.network.port) === "number") {
        this.port = env.network.port; // DEPRECATED
        this.network.port = env.network.port;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No port specified; defaulting to port 80.\x1b[0m`);
        this.port = 80; // DEPRECATED
        this.network.port = 80;
      }
    } else {
      isValid = false
      console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing network credentials.\x1b[0m`);
    }

    this.debug = {};
    if (typeof (env.debug) === "object") {
      this.debug.logHTTPRequestsToConsole = typeof env.debug.logHTTPRequestsToConsole === "boolean" ? env.debug.logHTTPRequestsToConsole : false;
      this.debug.logQueriesToConsole = typeof env.debug.logHTTPRequestsToConsole === "boolean" ? env.debug.logHTTPRequestsToConsole : false;
      this.debug.logWebSocket = typeof env.debug.logWebSocket === "boolean" ? env.debug.logWebSocket : false;
      this.debug.restartOnFileChange = typeof env.debug.restartOnFileChange === "boolean" ? env.debug.restartOnFileChange : false;
      this.debug.reloadClientsAfterRestart = typeof env.debug.reloadClientsAfterRestart === "boolean" ? env.debug.reloadClientsAfterRestart : false;
    } else {
      this.debug.logHTTPRequestsToConsole = false;
      this.debug.logQueriesToConsole = false;
      this.debug.logWebSocket = false;
      this.debug.restartOnFileChange = false;
      this.debug.reloadClientsAfterRestart = false;
    }

    const randomSecret = new UUID().string.split("-").join("");
    this.security = {};
    if (typeof (env.security) === "object") {
      this.security.csrf = typeof env.security.csrf === "boolean" ? env.security.csrf : true;
      this.security.payloadLimit = typeof env.security.payloadLimit === "string" ? env.security.payloadLimit : "50mb";
      this.security.secret = typeof env.security.secret === "string" && env.security.secret !== "" ? env.security.secret : randomSecret;
      this.security.saltRounds = typeof env.security.saltRounds === "number" ? env.security.saltRounds : 10;
    } else {
      this.security.csrf = false;
      this.security.payloadLimit = "50mb";
      this.security.secret = randomSecret;
      this.security.saltRounds = 10;
    }

    this.capabilities = {};
    if (typeof (env.capabilities) === "object") {
      this.capabilities.isUsingSSL = typeof env.capabilities.isUsingSSL === "boolean" ? env.capabilities.isUsingSSL : true;
      this.capabilities.webSockets = typeof env.capabilities.useWebSockets === "boolean" ? env.capabilities.useWebSockets : false; // Deprecated
      this.capabilities.webSockets = typeof env.capabilities.webSockets === "boolean" ? env.capabilities.webSockets : false;
      this.capabilities.middleware = typeof env.capabilities.useMiddleware === "boolean" ? env.capabilities.useMiddleware : true; // Deprecated
      this.capabilities.middleware = typeof env.capabilities.middleware === "boolean" ? env.capabilities.middleware : true;
      this.capabilities.email = typeof env.capabilities.useEmail === "boolean" ? env.capabilities.useEmail : false; // Deprecated
      this.capabilities.email = typeof env.capabilities.email === "boolean" ? env.capabilities.email : false;
    }

    this.email = {};
    if (typeof (env.email) === "object") {
      this.email = env.email;
    } else {
      console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): Environment is missing mail server credentials.\x1b[0m`);
    }

    this.database = {};
    if (typeof (env.database) === "object") {
      if (typeof env.database.sessionStore === "string" && DB_STORE_OPTIONS.includes(env.database.sessionStore)) {
        this.database.sessionStore = env.database.sessionStore;
      } else if (typeof env.auth.sessionStore === "string" && DB_STORE_OPTIONS.includes(env.auth.sessionStore)) {
        this.database.sessionStore = env.auth.sessionStore; // DEPRECATED
      } else {
        this.database.sessionStore = null;
      }
      if (typeof (env.database.host) === "string") {
        this.database.host = env.database.host;
      } else {
        isValid = false
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database host.\x1b[0m`);
      }
      if (typeof (env.database.user) === "string") {
        this.database.user = env.database.user;
      } else {
        isValid = false
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database user.\x1b[0m`);
      }
      if (typeof (env.database.password) === "string") {
        this.database.password = env.database.password;
      } else {
        isValid = false
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database password.\x1b[0m`);
      }
      if (typeof (env.database.database) === "string") {
        this.database.database = env.database.database;
      } else {
        isValid = false
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database name.\x1b[0m`);
      }
      if (typeof (env.database.connectionLimit) === "number")
        this.database.connectionLimit = env.database.connectionLimit;
      this.database.multipleStatements = true;
    } else {
      isValid = false
      console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database credentials.\x1b[0m`);
    }

    this.useMapKit = typeof env.useMapKit === "boolean" ? env.useMapKit : false;
    this.allowRegister = typeof env.allowRegister === "boolean" ? env.allowRegister : false;
    this.restrictMapsToDomain = typeof env.restrictMapsToDomain === "boolean" ? env.restrictMapsToDomain : true;

    this.title = typeof env.info.title === "string" ? env.info.title : packageConfig.name;
    this.version = typeof env.info.version === "string" ? env.info.version : packageConfig.version;
    this.description = typeof env.info.description === "string" ? env.info.description : packageConfig.description ? packageConfig.description : null;
    this.appleDeveloperTeamID = typeof env.appleDeveloperTeamID === "string" ? env.appleDeveloperTeamID : null;
    this.mapKitJSKeyID = typeof env.mapKitJSKeyID === "string" ? env.mapKitJSKeyID : null;
    this.APNSKeyID = typeof env.APNSKeyID === "string" ? env.APNSKeyID : null;
    this.APNSIsProduction = typeof env.APNSIsProduction === "boolean" ? env.APNSIsProduction : false;
    this.appBundleID = typeof env.appBundleID === "string" ? env.appBundleID : null;
    this.mollieAPIKey = typeof env.mollieAPIKey === "string" ? env.mollieAPIKey : null;

    this.info = {};
    this.info.title = this.title;
    this.info.version = this.version;
    this.info.description = this.description;

    if (!isValid) {
      this.save();
      process.exit(AFError.ENVINVALID);
    }
  }

}


export default AFEnvironment;