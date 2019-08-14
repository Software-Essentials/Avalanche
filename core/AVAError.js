
/**
 * @description Collection of errorcodes.
 */
class AVAError {

    constructor() {

    }

}

AVAError.NOTANAVAPROJECT = 1;
AVAError.NOENV = 2;
AVAError.ENVINVALID = 3;
AVAError.AVAALREADYINIT = 4;
AVAError.INCOMPLETECORE = 5;

module.exports = AVAError;