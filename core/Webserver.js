// Dependencies
const http = require("http")



/**
 * 
 */
class Webserver {

  constructor(app) {
    this.stream = null;
    var instance = null;

    this.willStart(this);

    instance = http.createServer(app);
    
    if (global.environment.port === 443) {
      // If running on https we need to redirect http to https
      const httpServer = http.createServer((request, response) => {
        response.writeHead(301, { Location: `https://${request.headers.host}${request.url}` });
        response.end();
      });
      httpServer.listen(80, global.environment.host);
    }

    // Setup listener
    this.stream = instance.listen(global.environment.port, global.environment.host, () => {
      this.didStart(this);
    });
    this.stream.on("error", (error) => {
      const knownError = "listen EACCES: permission denied";
      if(error.message.includes(knownError)) {
        console.log(`\x1b[31m[AVALANCHE] Unable to start server because port ${global.environment.port} is in use\x1b[0m`);
      } else {
        console.log(`\x1b[31m[AVALANCHE] An unknown error occured: \x1b[0m"${error.message}`);
      }
    });
  }

  willStart(webserver) {

  }

  didStart(webserver) {
    console.log(`\x1b[32m[AVALANCHE] Webserver served on ${global.environment.port === 443 ? "https://" : "http://"}${global.environment.host}:${global.environment.port}\x1b[0m`);
    if(global.environment.reloadClientsAfterRestart) {
      webserver.reloadConnectedClients();
    }
  }

  getStream() {
    return this.stream;
  }

  reloadConnectedClients() {
    setTimeout(() => {
      const connections = global.socket.connections;
      for (const key in connections) {
        const connection = connections[key];
        connection.socket.emit("reload");
      }
    }, 2000);
  }

}



module.exports = Webserver;
