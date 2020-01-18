import http from "http";
import { terminalPrefix } from "./ACUtil";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACWebServer {

  constructor(app) {
    this.stream = null;
    var instance = null;

    this.willStart(this);

    instance = http.createServer(app);

    if (environment.port === 443) {
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
      const message = error.message;
      if (message.includes("EACCES")) {
        console.log(`${terminalPrefix()}\x1b[31m\x1b[2m [EACCESS]\x1b[0m\x1b[31m Unable to start server because Avalanche doesn't have permission to use port '${global.environment.port}' on IP '${global.environment.host}'.\x1b[0m`);
        return;
      }
      if (message.includes("EADDRINUSE")) {
        console.log(`${terminalPrefix()}\x1b[31m\x1b[2m [EADDRINUSE]\x1b[0m\x1b[31m Unable to start server because port '${global.environment.port}' on IP '${global.environment.host}' is already in use.\x1b[0m`);
        return;
      }
      console.log(`${terminalPrefix()}\x1b[31m An unknown error occured: \x1b[0m${error.message}`);
    });
  }

  willStart(webserver) {

  }

  didStart(webserver) {
    console.log(`${terminalPrefix()}\x1b[32m Webserver served on ${global.environment.port === 443 ? "https://" : "http://"}${global.environment.host}:${global.environment.port}\x1b[0m`);
    global.socket.upSince = Math.round(new Date().valueOf() / 1000);
  }

  getStream() {
    return this.stream;
  }

}


export default ACWebServer;