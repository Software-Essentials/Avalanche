// Dependencies
const express = require("express");
const fs = require("fs");
const path = require("path");
const url = require("url");

// Setup
const ExRouter = express.Router();



class Router {

    constructor() {
    }

    routes() {
        const normalizedPath = `${projectPWD}/app/routes`;
        var routes = [];
        fs.readdirSync(normalizedPath).forEach(function (file) {
            const extensions = file.split(".");
            if (extensions.length === 2) {
                if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
                    const route = JSON.parse(JSON.stringify(require(`${projectPWD}/app/routes/${file}`)));
                    routes.push.apply(routes, route);
                }
            }
        });
        const normalizedPathB = `${projectPWD}/app/middleware`;
        var middleware = [];
        if (fs.existsSync(normalizedPathB)) {
            fs.readdirSync(normalizedPathB).forEach(function (file) {
                const extensions = file.split(".");
                if (extensions.length === 2) {
                    if (extensions[extensions.length - 1].toUpperCase() === "JS") {
                        const middleFile = require(`${projectPWD}/app/middleware/${file}`);
                        middleware[extensions[0]] = middleFile;
                    }
                }
            });
        }
        for(var i = 0; i < routes.length; i++) {
            const route = routes[i];
            const method = route.method;
            const routePath = route.path;
            const routeMiddleware = route.middleware;
            const routePermission = route.permission;
            const controllerFile = route.controller;
            const controllerHandler = route.handler;
            var controller;
            if(typeof(route.redirect) === "string") {
                ExRouter[method.toLowerCase()](routePath, (request, response) => {
                    response.redirect(url.format({
                        pathname: route.redirect,
                    }));
                });
                continue;
            }
            var routeHandler;
            if(typeof(controllerHandler) === "string") {
                // Controller handler
                if (fs.existsSync(path.join(__dirname, `./controllers/${controllerFile}.js`))) {
                    controller = require(`./controllers/${controllerFile}.js`);
                } else {
                    controller = require(`${projectPWD}/app/controllers/${controllerFile}.js`);
                }
                routeHandler = new controller()[controllerHandler];
                if(typeof routeMiddleware === "object") {
                    const filteredMiddlewareKeys = Object.keys(middleware).filter(function(i) {
                        return routeMiddleware.includes(i);
                    });
                    var filteredMiddleware = [];
                    for (let i = 0; i < filteredMiddlewareKeys.length; i++) {
                        const key = filteredMiddlewareKeys[i];
                        const ob = middleware[key];
                        filteredMiddleware[i] = new ob().init;
                    }
                    ExRouter[method.toLowerCase()](routePath, filteredMiddleware, routeHandler);
                } else {
                    ExRouter[method.toLowerCase()](routePath, routeHandler);
                }
            } else {
                // ViewController handler
                if (fs.existsSync(path.join(__dirname, `./views/${controllerFile}.js`))) {
                    controller = require(`./views/${controllerFile}.js`);
                } else {
                    controller = require(`${projectPWD}/app/views/${controllerFile}.js`);
                }
                new controller((routeHandler, that) => {
                    if(typeof routeMiddleware === "object") {
                        const filteredMiddlewareKeys = Object.keys(middleware).filter(function(i) {
                            return routeMiddleware.includes(i);
                        });
                        var filteredMiddleware = [];
                        for (let i = 0; i < filteredMiddlewareKeys.length; i++) {
                            const key = filteredMiddlewareKeys[i];
                            const ob = middleware[key];
                            filteredMiddleware[i] = new ob().init;
                        }
                        ExRouter[method.toLowerCase()](routePath, filteredMiddleware, (request, response) => { routeHandler(request, response, that); });
                    } else {
                        ExRouter[method.toLowerCase()](routePath, (request, response) => { routeHandler(request, response, that); });
                    }
                });
            }
        }
        ExRouter.use((request, response) => {
            const layout = "layout.hbs";
            response.status(404);
            response.render("status/404.hbs", {
                layout: layout
            });
            return;
        });
        return ExRouter;
    }

}



module.exports = Router;