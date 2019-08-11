
/**
 * @description Collection of errorcodes.
 */
class AVAError {

    constructor() {

    }

}

AVAError.prototype.NOTANAVAPROJECT = 1;
AVAError.prototype.NOENV = 2;
AVAError.prototype.ENVINVALID = 3;
AVAError.prototype.AVAALREADYINIT = 4;
AVAError.prototype.INCOMPLETECORE = 5;

module.exports = AVAError;