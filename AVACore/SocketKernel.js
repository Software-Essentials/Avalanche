import socketIO from "socket.io";
import { UUID } from "../AVAFoundation/AVAUtil";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class SocketKernel {

  constructor(server) {
    this.instance = socketIO(server);
    this.connections = [];

    if (environment.capabilities.useWebSockets) {
      this.setup();
      console.log(`\x1b[32m[AVALANCHE] Sockermanager initialized.\x1b[0m`)
    }
  }


  /**
   * Setsup the socket kernel
   */
  setup() {
    this.instance.on("connection", (socket) => {
      const uuid = new UUID().string
      console.log("\x1b[36m%s\x1b[0m", `[SOCKET]::[${uuid}] Connected`)
      this.connections[uuid] = { socket: socket };
      socket.on("disconnect", () => {
        console.log("\x1b[33m%s\x1b[0m", `[SOCKET]::[${uuid}] Disconnected`)
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


module.exports = SocketKernel;
export default SocketKernel;