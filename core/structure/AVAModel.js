// Imports
const Auth = require("../Auth.js");



/**
 * Super model
 */
class AVAModel {

    constructor() {
        this.connection = Auth.getConnection();
    }

}



module.exports = AVAModel;