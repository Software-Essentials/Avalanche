


/**
 * @author Lawrence Bensaid
 */
class AVANotification {

    /**
     * 
     * @param {String} title 
     * @param {String} body 
     * @param {Object} options 
     */
    constructor(title, body, options) {
        this.title = title;
        this.body = body;
        this.broadcast = options.broadcast === true ? true : false;
    }

    trigger() {
        const connections = global.socket.connections;
        for (const key in connections) {
            const connection = connections[key];
            console.log("\x1b[35m%s\x1b[0m", `[SOCKET]::[${key}] Sending notification`);
            connection.socket.emit("notification", {
                title: this.title,
                body: this.body
            });
        }
    }

}



module.exports = AVANotification;