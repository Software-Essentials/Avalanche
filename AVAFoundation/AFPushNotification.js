import { Provider, Notification } from "apn";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 * @description Handles iOS Push Notifications
 */
class AFPushNotification {

  /**
   * @param {String} title Title
   * @param {String} message Message body
   * @param {String} badge Badge
   * @param {String} sound Name of sound file. For example: "ping.aiff".
   * @param {any} threadID threadID for notification grouping
   */
  constructor() {
    this.sound = "ping.aiff";
    this.expiry = Math.floor(Date.now() / 1000) + 3600;
    if (arguments.length > 1) {
      this.title = typeof arguments[0] === "string" ? arguments[0] : environment.getTitle();
      this.message = typeof arguments[1] === "string" ? arguments[1] : "";
      this.badge = !isNaN(arguments[2]) ? arguments[2] : null;
      this.sound = typeof arguments[3] === "string" ? arguments[3] : "ping.aiff";
      this.threadID = !!arguments[4] ? arguments[4] : null;
    } else {
      this.tokens = Array.isArray(arguments[0]) ? arguments[0] : typeof arguments[0] === "string" ? arguments[0] : null;
    }
  }


  /**
   * @param {[String]} tokens Client device tokens.
   */
  push() {
    // console.log(`teamID: ${environment.appleDeveloperTeamID}; APNSKeyID: ${environment.APNSKeyID}; production: ${environment.APNSIsProduction}; appBundleID: ${environment.appBundleID};`);
    if (arguments.length > 1) { /** @deprecated */
      this.title = typeof arguments[0] === "string" ? arguments[0] : environment.getTitle();
      this.message = typeof arguments[1] === "string" ? arguments[1] : "";
    } else {
      this.tokens = Array.isArray(arguments[0]) ? arguments[0] : typeof arguments[0] === "string" ? arguments[0] : null;
    }
    const apnProvider = new Provider({
      token: {
        key: `${projectPWD}/certificates/apns.p8`,
        keyId: environment.APNSKeyID,
        teamId: environment.appleDeveloperTeamID
      },
      production: environment.APNSIsProduction
    });
    const notification = new Notification();
    notification.topic = environment.appBundleID;
    notification.expiry = this.expiry;
    if (this.badge) {
      notification.badge = this.badge;
    }
    if (this.threadID) {
      notification.threadId = this.threadID;
    }
    notification.sound = this.sound;
    notification.alert = {
      title: this.title,
      body: this.message
      // action: "ACTION"
    };
    notification.payload = {};
    apnProvider.send(notification, this.tokens).then((response) => {
      // console.log("APNS response: ", response);
      for (const item of response.failed) {
        console.log(`\x1b[31m→● (${item.status})\x1b[0m ${item.device}`);
        // console.log("Error: ", item.response);
      }
      for (const item of response.sent) {
        console.log(`\x1b[32m→● (200)\x1b[0m ${item.device}`);
      }
    });
  }

}


export default AFPushNotification;