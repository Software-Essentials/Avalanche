const CoreUtil = require("../CoreUtil");


/**
 * @description Prints all the routes of the current project.
 */
function routes() {
  const routes = CoreUtil.getRoutes();
  if(routes.length <= 0) {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Can't show routes because there aren't any routes in the project.\x1b[0m`);
    return;
  }
  var string = "\n  \x1b[1m++======================================================================\x1b[0m\n";
  string += `  \x1b[1m||\x1b[0m\n`;
  for (const route of routes) {
    const path = route.path;
    const method = route.method;
    const controller = route.controller;
    const handler = typeof route.handler === "string" ? route.handler : null;
    const color =
      method === "GET" ? 32 :
      method === "POST" ? 33 :
      method === "PUT" ? 34 :
      method === "DELETE" ? 31 : 0
    string += `  \x1b[1m||\x1b[0m  [\x1b[${color}m\x1b[1m${method}\x1b[0m] \t \x1b[3m${path}\x1b[0m\t        \x1b[32m${controller}\x1b[0m${handler ? `.\x1b[33m${handler}\x1b[0m()` : ".\x1b[34mconstructor\x1b[0m" }\n`;
  }
  string += `  \x1b[1m||\x1b[0m\n`;
  string += "  \x1b[1m++======================================================================\x1b[0m\n";
  console.log(string);
}


module.exports.execute = routes;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "routes";
module.exports.description = "Prints all the routes in your project.";