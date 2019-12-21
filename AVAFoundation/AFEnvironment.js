import fs from "fs";
import AFError from "../AVAFoundation/AFError";
import * as ACUtil from "../AVACore/ACUtil";

const packageConfig = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


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
        if (extensions.length = 3)
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
        }
      } else {
        if (environmentKey === packageConfig.avalancheConfig.preferredEnvironment) {
          this.loadEnvironment(selectedEnvironment);
          prefferedEnvironmentLoaded = true;
        }
      }
    }
    if (!prefferedEnvironmentLoaded) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): Preffered environment not found; defaulting to "${selectedEnvironmentKey}".\x1b[0m`);
      this.loadEnvironment(selectedEnvironment);
    }
  }

  getFullURL() {
    const fullURL = (this.isUsingSSL ? "https://" : "http://") + (this.domain) + (this.isUsingSSL ? "" : (this.port === 80 ? "" : ":" + this.port));
    return fullURL;
  }

  loadEnvironment(env) {
    var isValid = true;

    this.network = {};
    if (typeof (env.network) === "object") {
      if (typeof (env.network.domain) === "string") {
        this.domain = env.network.domain;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No domain specified; defaulting to 'localhost'.\x1b[0m`);
        this.domain = "localhost";
      }
      if (typeof (env.network.host) === "string") {
        this.host = env.network.host;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No host specified; defaulting to '127.0.0.1'.\x1b[0m`);
        this.host = "127.0.0.1";
      }
      if (typeof (env.network.port) === "number") {
        this.port = env.network.port;
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): No port specified; defaulting to port 80.\x1b[0m`);
        this.port = 80;
      }
    } else {
      isValid = false
      console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing network credentials.\x1b[0m`);
    }

    this.debug = {};
    if (typeof (env.debug) === "object") {
      this.debug.logHTTPRequestsToConsole = typeof env.debug.logHTTPRequestsToConsole === "boolean" ? env.debug.logHTTPRequestsToConsole : false;
      this.debug.logQueriesToConsole = typeof env.debug.logHTTPRequestsToConsole === "boolean" ? env.debug.logHTTPRequestsToConsole : false;
      this.debug.restartOnFileChange = typeof env.debug.restartOnFileChange === "boolean" ? env.debug.restartOnFileChange : false;
    } else {
      this.debug.logHTTPRequestsToConsole = false;
      this.debug.logQueriesToConsole = false;
      this.debug.restartOnFileChange = false;
    }

    this.auth = {};
    if (typeof (env.auth) === "object") {
      if (typeof (env.auth.secret) === "string") {
        this.secret = env.auth.secret;
        this.auth.secret = env.auth.secret;
      } else {
        isValid = false;
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing secret value!\x1b[0m`);
      }
      this.saltRounds = typeof env.auth.saltRounds === "number" ? env.auth.saltRounds : 0;
      this.auth.saltRounds = typeof env.auth.saltRounds === "number" ? env.auth.saltRounds : 0;
      this.auth.sessionStore = typeof env.auth.sessionStore === "string" ? env.auth.sessionStore : null;
    } else {
      isValid = false
      console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error): Environment is missing auth credentials.\x1b[0m`);
    }

    this.security = {};
    if (typeof (env.security) === "object") {
      this.security.csrf = typeof env.security.csrf === "boolean" ? env.security.csrf : true;;
    } else {
      this.security.csrf = false;
    }

    this.capabilities = {};
    if (typeof (env.capabilities) === "object") {
      this.capabilities.isUsingSSL = typeof env.capabilities.isUsingSSL === "boolean" ? env.capabilities.isUsingSSL : true;
      this.capabilities.useWebSockets = typeof env.capabilities.useWebSockets === "boolean" ? env.capabilities.useWebSockets : false;
      this.capabilities.useMiddleware = typeof env.capabilities.useMiddleware === "boolean" ? env.capabilities.useMiddleware : true;
      this.capabilities.useEmail = typeof env.capabilities.useEmail === "boolean" ? env.capabilities.useEmail : false;
    }

    this.email = {};
    if (typeof (env.email) === "object") {
      this.email = env.email;
    } else {
      console.log(`${ACUtil.terminalPrefix()}\x1b[34m (notice): Environment is missing mail server credentials.\x1b[0m`);
    }

    this.database = {};
    if (typeof (env.database) === "object") {
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
    this.reloadClientsAfterRestart = typeof env.reloadClientsAfterRestart === "boolean" ? env.reloadClientsAfterRestart : false;

    this.title = typeof env.info.title === "string" ? env.info.title : packageConfig.name;
    this.version = typeof env.info.version === "string" ? env.info.version : packageConfig.version;
    this.description = typeof env.info.description === "string" ? env.info.description : packageConfig.description ? packageConfig.description : null;
    this.appleDeveloperTeamID = typeof env.appleDeveloperTeamID === "string" ? env.appleDeveloperTeamID : null;
    this.mapKitJSKeyID = typeof env.mapKitJSKeyID === "string" ? env.mapKitJSKeyID : null;
    this.APNSKeyID = typeof env.APNSKeyID === "string" ? env.APNSKeyID : null;
    this.appBundleID = typeof env.appBundleID === "string" ? env.appBundleID : null;
    this.mollieAPIKey = typeof env.mollieAPIKey === "string" ? env.mollieAPIKey : null;

    this.info = {};
    this.info.title = this.title;
    this.info.version = this.version;
    this.info.description = this.description;

    if (!isValid) {
      process.exit(AFError.ENVINVALID);
    }
  }

}


export default AFEnvironment;