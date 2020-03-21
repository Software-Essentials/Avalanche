import { Provider, Notification } from "apn";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 * @description Handles iOS Push Notifications
 */
class AFPushNotification {

  /**
   * @param {String} title Title
   * @param {String} message Message body
   */
  constructor() {
    if (arguments.length > 1) {
      this.title = typeof arguments[0] === "string" ? arguments[0] : environment.getTitle();
      this.message = typeof arguments[1] === "string" ? arguments[1] : "";
      this.badge = typeof arguments[2] === "string" ? arguments[2] : 0;
    } else {
      this.tokens = Array.isArray(arguments[0]) ? arguments[0] : typeof arguments[0] === "string" ? arguments[0] : null;
    }
    this.expiry = Math.floor(Date.now() / 1000) + 3600;
    this.sound = "ping.aiff";
  }


  /**
   * @param {[String]} tokens Client device tokens.
   */
  push() {
    if (arguments.length > 1) { /** @deprecated */
      this.title = typeof arguments[0] === "string" ? arguments[0] : environment.getTitle();
      this.message = typeof arguments[1] === "string" ? arguments[1] : "";
      this.badge = typeof arguments[2] === "string" ? arguments[2] : 0;
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
    notification.badge = badge;
    notification.sound = this.sound;
    notification.alert = {
      title: this.title,
      body: this.message
      // action: "ACTION"
    };
    notification.payload = {};
    apnProvider.send(notification, this.tokens).then((response) => {
      console.log("APNS response: ", response);
    });
  }

}


export default AFPushNotification;