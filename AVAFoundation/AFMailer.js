import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { isEmail } from "./AFUtil";


/**
 * @description Talks to the specified mailserver.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFMailer {

  constructor() {
    this.transporter = nodemailer.createTransport(global.environment.email["noreply"]);
    this.from = `"${global.environment.email["noreply"].name}" <${global.environment.email["noreply"].auth.user}>`;
  }

  /**
   * @description Sends email to all recipients.
   * @param {AFEMail} email 
   */
  send(email) {
    const callback = typeof arguments[1] === "function" ? arguments[1] : () => { };
    var to = [];
    for (const recipient of email.recipients) {
      if (isEmail(recipient.trim())) {
        to.push(recipient.toLowerCase().trim());
      }
    }
    const mailOptions = {
      from: this.from,
      to: to,
      subject: email.subject,
      template: email.template,
      context: email.context,
      attachments: email.attachments
    };

    this.transporter.use("compile", hbs(email.templateOptions));

    this.transporter.sendMail(mailOptions, function (error, results) {
      if (error) {
        console.log("Error: ", error);
        callback(false);
      } else {
        callback(true);
      }
    });
  }

  /**
   * @description Sends email-by-email to each individual recipient.
   * @param {AFEMail} email 
   */
  sendSeperately(email) {
    const callback = typeof arguments[1] === "function" ? arguments[1] : () => { };
    var mailOptions = {
      from: this.from,
      subject: email.subject,
      template: email.template,
      context: email.context,
      attachments: email.attachments
    };
    this.transporter.use("compile", hbs(email.templateOptions));
    var total = 0;
    var completed = 0;
    var callbackTriggered = false;
    for (const recipient of email.recipients) {
      if (isEmail(recipient.trim())) {
        total += 1;
        mailOptions["to"] = [recipient.toLowerCase().trim()];
        this.transporter.sendMail(mailOptions, (error, results) => {
          completed += 1;
          if (error) {
            console.log("Error: ", error);
          } else {
            update();
          }
        });
      }
    }
    function update() {
      if (total === completed) {
        callbackTriggered = true;
        if (callbackTriggered) {
          callback(true);
        }
      }
    }
  }

  /**
   * @deprecated
   * @param {*} recipient 
   * @param {*} subject 
   * @param {*} template 
   * @param {*} context 
   */
  sendMail(recipient, subject, template, context) {
    const callback = typeof arguments[4] === "function" ? arguments[4] : null;

    const options = {
      viewEngine: {
        extName: ".hbs",
        partialsDir: `${projectPWD}/app/templates/partials/`,
        layoutsDir: `${projectPWD}/app/templates/layouts`,
        defaultLayout: "email.layout.hbs",
      },
      viewPath: `${projectPWD}/app/templates/emails/`,
      extName: ".hbs",
    };
    this.transporter.use("compile", hbs(options));

    this.transporter.sendMail({
      from: this.from,
      to: recipient,
      subject: subject,
      template: template,
      context: context,
      attachments: attachments
    }, function (error, results) {
      if (error) {
        console.log("Error: ", error);
        if (typeof callback === "function") callback(false);
      } else {
        if (typeof callback === "function") callback(true);
      }
    });
  }

}


export default AFMailer;