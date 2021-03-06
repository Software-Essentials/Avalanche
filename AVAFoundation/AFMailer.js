import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";


/**
 * @description Talks to the specified mailserver.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFMailer {

  sendMail(recipient, subject, template, context) {
    const callback = typeof arguments[4] === "function" ? arguments[4] : null;
    let transporter = nodemailer.createTransport(global.environment.email["noreply"]);

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

    transporter.use("compile", hbs(options));

    transporter.sendMail({
      from: `"${global.environment.email["noreply"].name}" <${global.environment.email["noreply"].auth.user}>`,
      to: recipient,
      subject: subject,
      template: template,
      context: context
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