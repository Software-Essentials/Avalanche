
/**
 * @description Collection of errorcodes.
 */
class AVAError extends Error {

    constructor() {
        const message = typeof arguments[0] === "string" ? arguments[0] : undefined;
        if (message) {
            super(message);
        } else {
            super();
        }
    }

}

AVAError.NOTANAVAPROJECT = 1;
AVAError.NOENV = 2;
AVAError.ENVINVALID = 3;
AVAError.AVAALREADYINIT = 4;
AVAError.INCOMPLETECORE = 5;

module.exports = AVAError;