import socketIO from "socket.io";
import { UUID } from "../AVAFoundation/AFUtil";
import { ACUtil } from "../AVACore";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACSocketKernel {

  constructor(server) {
    this.instance = socketIO(server);
    this.connections = [];

    if (environment.capabilities.webSockets) {
      this.setup();
      console.log(`${ACUtil.terminalPrefix()}\x1b[32m Sockermanager initialized\x1b[0m`);
    }
  }


  /**
   * Setsup the socket kernel
   */
  setup() {
    this.instance.on("connection", (socket) => {
      const uuid = new UUID().string;
      if (environment.debug.logWebSocket) {
        console.log(`${ACUtil.terminalPrefix()} \x1b[34m[SOCKET]::[${uuid}]\x1b[32m Connected\x1b[0m`);
      }
      this.connections[uuid] = { socket: socket };
      socket.on("disconnect", () => {
        if (environment.debug.logWebSocket) {
          console.log(`${ACUtil.terminalPrefix()} \x1b[34m[SOCKET]::[${uuid}]\x1b[32m Disconnected\x1b[0m`);
        }
        delete this.connections[uuid];
      })
    });
  }


  /**
   * Returns the socket instance
   */
  getStream() {
    return this.instance;
  }

}


export default ACSocketKernel;