// Imports
const fs = require("fs");
const AVAError = require("../foundation/AVAError");
const packageConfig = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;



/**
 * 
 */
class AVAEnvironment {

    constructor() {

        var normalizedPath = `${projectPWD}/app/environments`;
        var environments = [];
        var selectedEnvironment = null;
        var selectedEnvironmentKey = null;
        if(fs.existsSync(normalizedPath)) {
            fs.readdirSync(normalizedPath).forEach(function (file) {
                const extensions = file.split(".");
                if (extensions.length = 3)
                    if (extensions[extensions.length - 1].toUpperCase() === "JSON")
                        if (extensions[extensions.length - 2].toUpperCase() === "ENVIRONMENT")
                            environments[extensions[0]] = require(`${projectPWD}/app/environments/${file}`);
            });
        }
        
        if(Object.keys(environments).length <= 0) {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment file missing!\x1b[0m`);
            process.exit(AVAError.NOENV);
        }

        var prefferedEnvironmentLoaded = false;
        const environmentKeys = Object.keys(environments);
        for (var i = 0; i < environmentKeys.length; i++) {
            const environmentKey = environmentKeys[i];
            const environment = environments[environmentKey];
            selectedEnvironment = environment;
            selectedEnvironmentKey = environmentKey;
            if(typeof arguments[0] === "string") {
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
            console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice): Preffered environment not found; defaulting to "${selectedEnvironmentKey}".\x1b[0m`);
            this.loadEnvironment(selectedEnvironment);
        }
    }

    getFullURL() {
        const fullURL = (this.isUsingSSL ? "https://" : "http://") + (this.domain) + (this.isUsingSSL ? "" : (this.port === 80 ? "" : ":" + this.port));
        return fullURL;
    }

    loadEnvironment(environment) {
        var isValid = true;

        this.network = {};
        if(typeof(environment.network) === "object") {
            if (typeof(environment.network.domain) === "string") {
                this.domain = environment.network.domain;
            } else {
                console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice): No domain specified; defaulting to 'localhost'.\x1b[0m`);
                this.domain = "localhost";
            }
            if (typeof(environment.network.host) === "string") {
                this.host = environment.network.host;
            } else {
                console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice): No host specified; defaulting to '127.0.0.1'.\x1b[0m`);
                this.host = "127.0.0.1";
            }
            if (typeof(environment.network.port) === "number") {
                this.port = environment.network.port;
            } else {
                console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice): No port specified; defaulting to port 80.\x1b[0m`);
                this.port = 80;
            }
        } else {
            isValid = false
            console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing network credentials.\x1b[0m`);
        }

        this.debug = {};
        if(typeof(environment.debug) === "object") {
            this.logHTTPRequestsToConsole = typeof environment.debug.logHTTPRequestsToConsole === "boolean" ? environment.debug.logHTTPRequestsToConsole : false;
            this.restartOnFileChange = typeof environment.debug.restartOnFileChange === "boolean" ? environment.debug.restartOnFileChange : false;
        } else {
            this.logHTTPRequestsToConsole = false;
            this.restartOnFileChange = false;
        }
        
        this.auth = {};
        if(typeof(environment.auth) === "object") {
            if(typeof(environment.auth.secret) === "string") {
                this.secret = environment.auth.secret;
                this.auth.secret = environment.auth.secret;
            } else {
                isValid = false;
                console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing secret value!\x1b[0m`);
            }
            this.saltRounds = typeof environment.auth.saltRounds === "number" ? environment.auth.saltRounds : 0;
            this.auth.saltRounds = typeof environment.auth.saltRounds === "number" ? environment.auth.saltRounds : 0;
            this.auth.sessionStore = typeof environment.auth.sessionStore === "string" ? environment.auth.sessionStore : null;
        } else {
            isValid = false
            console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing auth credentials.\x1b[0m`);
        }

        this.security = {};
        if(typeof(environment.security) === "object") {
            this.security.csrf = typeof environment.security.csrf === "boolean" ? environment.security.csrf : true;;
        } else {
            this.security.csrf = false;
        }
        
        this.capabilities = {};
        if(typeof(environment.capabilities) === "object") {
            this.capabilities.isUsingSSL = typeof environment.capabilities.isUsingSSL === "boolean" ? environment.capabilities.isUsingSSL : true;
            this.capabilities.useWebSockets = typeof environment.capabilities.useWebSockets === "boolean" ? environment.capabilities.useWebSockets : false;
            this.capabilities.useMiddleware = typeof environment.capabilities.useMiddleware === "boolean" ? environment.capabilities.useMiddleware : true;
            this.capabilities.useEmail = typeof environment.capabilities.useEmail === "boolean" ? environment.capabilities.useEmail : false;
        }
        
        this.email = {};
        if(typeof(environment.email) === "object") {
            this.email = environment.email;
        } else {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[34m (notice): Environment is missing mail server credentials.\x1b[0m`);
        }

        this.database = {};
        if(typeof(environment.database) === "object") {
            if(typeof(environment.database.host) === "string") {
                this.database.host = environment.database.host;
            } else {
                isValid = false
                console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database host.\x1b[0m`);
            }
            if(typeof(environment.database.user) === "string") {
                this.database.user = environment.database.user;
            } else {
                isValid = false
                console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database user.\x1b[0m`);
            }
            if(typeof(environment.database.password) === "string") {
                this.database.password = environment.database.password;
            } else {
                isValid = false
                console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database password.\x1b[0m`);
            }
            if(typeof(environment.database.database) === "string") {
                this.database.database = environment.database.database;
            } else {
                isValid = false
                console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database name.\x1b[0m`);
            }
            if (typeof(environment.database.connectionLimit) === "number")
                this.database.connectionLimit = environment.database.connectionLimit;
            if (typeof(environment.database.multipleStatements) === "boolean")
                this.database.multipleStatements = environment.database.multipleStatements;
        } else {
            isValid = false
            console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error): Environment is missing database credentials.\x1b[0m`);
        }

        this.useMapKit = typeof environment.useMapKit === "boolean" ? environment.useMapKit : false;
        this.allowRegister = typeof environment.allowRegister === "boolean" ? environment.allowRegister : false;
        this.restrictMapsToDomain = typeof environment.restrictMapsToDomain === "boolean" ? environment.restrictMapsToDomain : true;
        this.reloadClientsAfterRestart = typeof environment.reloadClientsAfterRestart === "boolean" ? environment.reloadClientsAfterRestart : false;

        this.title = typeof environment.info.title === "string" ? environment.info.title : packageConfig.name;
        this.version = typeof environment.info.version === "string" ? environment.info.version : packageConfig.version;
        this.description = typeof environment.info.description === "string" ? environment.info.description : packageConfig.description ? packageConfig.description : null;
        this.appleDeveloperTeamID = typeof environment.appleDeveloperTeamID === "string" ? environment.appleDeveloperTeamID : null;
        this.mapKitJSKeyID = typeof environment.mapKitJSKeyID === "string" ? environment.mapKitJSKeyID : null;
        this.APNSKeyID = typeof environment.APNSKeyID === "string" ? environment.APNSKeyID : null;
        this.appBundleID = typeof environment.appBundleID === "string" ? environment.appBundleID : null;
        this.mollieAPIKey = typeof environment.mollieAPIKey === "string" ? environment.mollieAPIKey : null;

        this.info = {};
        this.info.title = this.title;
        this.info.version = this.version;
        this.info.description = this.description;

        if(!isValid) {
            process.exit(AVAError.ENVINVALID);
        }
    }

}



module.exports = AVAEnvironment;
