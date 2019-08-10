// Dependencies
const fs = require("fs");
const bodyParser = require('body-parser');
const express = require("express");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");

// Imports
const Router = require("./Router.js");
const SocketKernel = require("./SocketKernel.js");
const Auth = require("./Auth.js");

const projectPWD = process.env.PWD;


/**
 * The Kernel is the primary entry point of the system. It acts as a gateway between the listener and the rest of the system.
 * Basicly don't mess with this code.
 */
class Kernel {

	constructor(app, stream) {

		// Template configuration
		this.templateConfiguration = {
			extname: ".hbs",
			layoutsDir: "app/templates/layouts",
			partialsDir: "app/templates/partials",
			defaultLayout: "layout"
		}

		// Install helpers
		const dir = fs.readdirSync(`${projectPWD}/app/helpers`);
		var helpers = {};
		for (const file of dir) {
			if(fs.existsSync(`${projectPWD}/app/helpers/${file}`)) {
				const helpersInFile = require(`${projectPWD}/app/helpers/${file}`);
				const keys = Object.keys(helpersInFile);
				for (const key of keys) {
					helpers[key] = helpersInFile[key];
				}
			}
		}
		this.templateConfiguration.helpers = helpers;

		// Session configuration
		this.sessionConfiguration = {
			name: "Auth",
			secret: global.environment.secret,
			resave: true,
			saveUninitialized: true,
			cookie: {
				secure: false,
				maxAge: Infinity
			}
		};

		// Global sockets
		global.socket = new SocketKernel(stream);
		global.cronjobs = {};
		global.database = Auth.getConnection();

		// Tell express to use Handlebars
		app.set("view engine", "hbs");
		app.engine("hbs", exphbs(this.templateConfiguration));

		// Proxy settings
		app.set("trust proxy", 1);

		// Default middle
		app.use(this.middleware);

		// Upload file size limit
		app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
		app.use(bodyParser.json({ limit: "50mb" }));

		// Setup static folder
		app.use(express.static("app/public"));

		// Utilize cookie parser
		app.use(cookieParser());

		// Setup session
		app.use(session(this.sessionConfiguration));

		// Redefine view directory
		app.set('views', 'app/templates');

		// Utilize router
		app.use(new Router().routes());
	}

	middleware(request, response, next) {

		next();

		// Request logger
		if (global.environment.logHTTPRequestsToConsole) {
			const now = new Date().toLocaleString();
			const log = `[${now}]::[${request.method}] >> ${request.url}`;
			const status = response.statusCode;
			const color = status === 200 ? 32 : status === 304 ? 33 : 31
			console.log(`[\x1b[1m${now}\x1b[0m]::[\x1b[36m\x1b[1m${request.method}\x1b[0m]::[\x1b[${color}m${status}\x1b[0m] >> \x1b[4m${request.url}\x1b[0m`);
			fs.appendFile(`${projectPWD}/logs/server.log`, `${log}\n`, (error) => { });
		}

	}

}



module.exports = Kernel;