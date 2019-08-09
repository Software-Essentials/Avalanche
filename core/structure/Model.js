// Imports
const Auth = require("../Auth.js");



/**
 * Super model
 */
class Model {

    constructor() {
        this.connection = Auth.getConnection();
    }

}



module.exports = Model;