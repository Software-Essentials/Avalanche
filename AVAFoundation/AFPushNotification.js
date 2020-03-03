import { Provider, Notification } from "apn";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFPushNotification {

  constructor(tokens) {
    this.tokens = tokens;
  }

  /**
   * @param {String} title Title
   * @param {String} message Content
   */
  push(title, message) {
    var apnProvider = new Provider({
      token: {
        key: `${projectPWD}/certificates/apns.p8`,
        keyId: environment.APNSKeyID,
        teamId: environment.appleDeveloperTeamID
      },
      production: environment.APNSIsProduction
    });
    var notification = new Notification();
    notification.topic = environment.appBundleID;
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    notification.badge = 1;
    notification.sound = "ping.aiff";
    notification.alert = {
      title: title,
      body: message
      // action: "ACTION"
    };
    notification.payload = {};
    apnProvider.send(notification, this.tokens).then((response) => {
    });
  }

}


export default AFPushNotification;