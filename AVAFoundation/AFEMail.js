

/**
 * @description Email that can be sent with the AFMailer
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFEMail {
    
    /**
     * 
     * @param {String} subject Subject of the email thread.
     * @param {String|Array} recipients Where the mail will be sent.
     * @param {Array} attachments (optional)
     * @param {String} template (optional)
     * @param {Object} context (optional)
     */
    constructor(subject, recipients) {
        this.subject = subject;
        this.recipients = recipients;
        this.attachments = arguments[2] ? arguments[2] : null;
        this.template = arguments[3] ? arguments[3] : null;
        this.context = arguments[4] ? arguments[4] : null;

        this.templateOptions = {
            viewEngine: {
                extName: ".hbs",
                partialsDir: `${projectPWD}/app/templates/partials/`,
                layoutsDir: `${projectPWD}/app/templates/layouts`,
                defaultLayout: "email.layout.hbs",
            },
            viewPath: `${projectPWD}/app/templates/emails/`,
            extName: ".hbs",
        };
    }

}


export default AFEMail;