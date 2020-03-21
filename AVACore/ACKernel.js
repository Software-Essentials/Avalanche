import fs from "fs";
import bodyParser from "body-parser";
import express from "express";
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import { AFDatabase } from "../index";
import { terminalPrefix } from "./ACUtil";
import ACRouter from "./ACRouter";
import ACSocketKernel from "./ACSocketKernel";
import csrf from "csurf";
import connectMySQL from "connect-mysql";

const MySQLStore = connectMySQL(session);


/**
 * @description The ACKernel is the primary entry point of the system. It acts as a gateway between the listener and the rest of the system.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACKernel {

  constructor(app, stream) {

    // Template configuration
    this.templateConfiguration = {
      extname: ".hbs",
      layoutsDir: "app/templates/layouts",
      partialsDir: "app/templates/partials",
      defaultLayout: "layout"
    }

    // Install helpers
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
    this.templateConfiguration.helpers = helpers;

    // Session configuration
    this.sessionConfiguration = {
      name: "Auth",
      secret: environment.security.secret,
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        expires: 1000 * 60 * 60 * 24 * 3
      }
    };
    try {
      const sessionStore = environment.database.sessionStore;
      if (typeof sessionStore === "string") {
        switch (sessionStore) {
          case "MYSQL":
            this.sessionConfiguration.store = new MySQLStore({ config: environment.database, table: environment.database.sessionTable || "_AVASession" });
            break;
        }
      }
    } catch (error) {
      console.log("ERRCHECKPOINT", error);
    }

    // Global sockets
    global.socket = new ACSocketKernel(stream);
    global.cronjobs = {};
    global.database = new AFDatabase(environment.getDBCredentials()).connection;

    // Tell express to use EJS
    // app.set('view engine', 'ejs');

    // Tell express to use Handlebars
    app.set("view engine", "hbs");
    app.engine("hbs", exphbs(this.templateConfiguration));

    // Proxy settings
    app.set("trust proxy", 1);

    // Default middle
    app.use(this.middleware);

    // Upload file size limit
    // app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ limit: environment.security.payloadLimit, extended: false }));
    app.use(bodyParser.json({ limit: environment.security.payloadLimit }));

    // Setup static folder
    app.use(express.static("app/public"));

    // Utilize cookie parser
    app.use(cookieParser());

    // Setup session
    app.use(session(this.sessionConfiguration));

    // Redefine view directory
    app.set('views', 'app/templates');

    // CSRF middleware
    if (environment.security.csrf) {
      app.use(csrf({ cookie: true }));
      app.use((error, request, response, next) => {
        if (error.code === "EBADCSRFTOKEN") {
          response.status(403);
          response.json({
            success: false,
            message: "Invalid CSRF token!"
          });
        }
      });
    }

    // Utilize router
    app.use(new ACRouter());
  }

  middleware(request, response, next) {

    next();

    // Request logger
    if (environment.debug.logHTTPRequestsToConsole) {
      const now = new Date();
      const method = request.method;
      const status = response.statusCode;
      const log = `[${now.toLocaleString()}]\t[${method}::${status}]\t>> ${request.url}`;
      const color = status === 200 ? 32 : status === 304 ? 33 : 31
      const methodColor =
        method === "GET" ? 32 :
          method === "POST" ? 33 :
            method === "PUT" ? 34 :
              method === "DELETE" ? 31 : 0
      console.log(`[\x1b[1m${now.toLocaleTimeString()}\x1b[0m]::[\x1b[${methodColor}m\x1b[1m${method}\x1b[0m]::[\x1b[${color}m${status}\x1b[0m] >> \x1b[4m${request.url}\x1b[0m`);
      if (!fs.existsSync(`${projectPWD}/logs`)) {
        fs.mkdirSync(`${projectPWD}/logs`);
      }
      fs.appendFile(`${projectPWD}/logs/requests.log`, `${log}\n`, (error) => {
        if (error) {
          console.log(`${terminalPrefix()}\x1b[33m ${error.message}\x1b[0m`);
        }
      });
    }

  }

}


export default ACKernel;