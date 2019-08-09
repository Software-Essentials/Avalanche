// Dependencies
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const mg = require("nodemailer-mailgun-transport");
const hbs = require("nodemailer-express-handlebars");



class Mailer {

  sendMail(recipient, subject, template, context) {
    const callback = typeof arguments[4] === "function" ? arguments[4] : null;
    let transporter = nodemailer.createTransport(global.environment.email["noreply"]);

    const options = {
      viewEngine: {
        extName: ".hbs",
        partialsDir: __dirname + "/../app/templates/partials/",
        layoutsDir: __dirname + "/../app/templates/layouts",
        defaultLayout: "email.layout.hbs",
      },
      viewPath: __dirname + "/../app/templates/emails/",
      extName: ".hbs",
    };

    transporter.use("compile", hbs(options));

    transporter.sendMail({
      from: `"${global.environment.email["noreply"].name}" <${global.environment.email["noreply"].auth.user}>`,
      to: recipient,
      subject: subject,
      template: template,
      context: context
    }, function (error, results) {
      if(error) {
        console.log("Error: ", error);
        if(typeof callback === "function") callback(false);
      } else {
        if(typeof callback === "function") callback(true);
      }
    });
  }

}



module.exports = Mailer;