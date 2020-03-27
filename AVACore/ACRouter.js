import { Router } from "express";
import fs from "fs";
import path from "path";
import AFValidator from "../AVAFoundation/AFValidator";
import { terminalPrefix } from "../AVACore/ACUtil";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACRouter extends Router {

    constructor() {
        super();

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

        // Load required middleware.
        const normalizedPathB = `${projectPWD}/app/middleware`;
        var middlewareHandlers = {};
        if (fs.existsSync(normalizedPathB)) {
            fs.readdirSync(normalizedPathB).forEach(function (file) {
                const extensions = file.split(".");
                if (extensions.length === 2) {
                    if (extensions[extensions.length - 1].toUpperCase() === "JS") {
                        const middleFile = require(`${projectPWD}/app/middleware/${file}`).default;
                        middlewareHandlers[extensions[0]] = middleFile;
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

        // Initialize routes.
        for (var i = 0; i < routes.length; i++) {
            const route = routes[i];
            const method = route.method;
            const routePath = route.path;

            // console.log(`${route.method} ${route.path}\t\t\t\t`, Object.keys(route.domains || [])); // Debug log

            // Load domain controllers
            for (const domain of Object.keys(route.domains)) {
                const components = route.domains[domain];
                if (typeof components.controller === "string") {
                    if (typeof components.handler === "string") {
                        // Controller
                        var controller = null;
                        if (fs.existsSync(`${projectPWD}/app/controllers/${components.controller}.js`)) {
                            controller = require(`${projectPWD}/app/controllers/${components.controller}.js`).default;
                            const routeHandler = new controller();
                            if (typeof routeHandler[components.handler] !== "function") {
                                console.log(`${terminalPrefix()}\x1b[33m (warn) Endpoint '${route.path}' leads to a handler/method that doesn't exist: '${components.handler}'.\x1b[0m`);
                            }
                            components.execution = (request, response) => {
                                routeHandler[components.handler](request, response);
                            };
                        } else {
                            console.log(`${terminalPrefix()}\x1b[33m (warn) Endpoint '${route.path}' leads to a controller that doesn't exist: '${components.controller}'.\x1b[0m`);
                        }
                    } else {
                        // View controller
                        var controller = null;
                        if (fs.existsSync(path.join(__dirname, `./views/${components.controller}.js`))) {
                            controller = require(`./views/${components.controller}.js`).default;
                        } else {
                            controller = require(`${projectPWD}/app/views/${components.controller}.js`).default;
                        }
                        components.control = new controller();
                        components.execution = (request, response) => {
                            components.control.willLoad(request, response, components.control);
                        };
                    }
                } else if (typeof components.file === "string") {
                    components.execution = (request, response) => { response.render(components.file); };
                }
            }

            // Setup middleware
            var middleware = (request, response, next) => {
                const domain = request.headers.host.split(":")[0];
                if (route.domains.hasOwnProperty("*") || route.domains.hasOwnProperty(domain)) {
                    const components = route.domains.hasOwnProperty(domain) ? route.domains[domain] : route.domains["*"];
                    handleMiddleware(middlewareHandlers, components.middleware, components.control, request, response, () => {
                        new AFValidator(request);
                        next();
                    });
                    return;
                }
                next();
            };

            // Setup handler
            var handler = (request, response) => {
                const domain = request.headers.host.split(":")[0];
                if (route.domains.hasOwnProperty("*") || route.domains.hasOwnProperty(domain)) {
                    const components = route.domains.hasOwnProperty(domain) ? route.domains[domain] : route.domains["*"];
                    if (typeof components.execution === "function") {
                        components.execution(request, response);
                    }
                } else {
                    const layout = "layout.hbs";
                    response.status(404);
                    response.render("status/404.hbs", {
                        layout: layout
                    });
                }
            };
            this[method.toLowerCase()](routePath, middleware, handler);
        }

        this.use((request, response) => {
            const layout = "layout.hbs";
            response.status(404);
            response.render("status/404.hbs", {
                layout: layout
            });
        });
    }

}

function handleMiddleware(middlewareHandlers, middlewareNames, controller, request, response, next) {
    if (Array.isArray(middlewareNames) && middlewareNames.length > 0) {
        const middleware = JSON.parse(JSON.stringify(middlewareNames));
        const mw = middlewareHandlers[middleware[0]];
        const mwo = new mw();
        mwo.init(request, response, () => {
            middleware.shift();
            handleMiddleware(middlewareHandlers, middleware, controller, request, response, next);
        }, controller);
    } else {
        next();
    }
}


export default ACRouter;