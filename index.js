// General
module.exports.AVALocalisation = require("./core/AVALocalisation.js");
module.exports.AVANotification = require("./core/AVANotification.js");
module.exports.AVAEnvironment = require("./core/AVAEnvironment.js");
module.exports.AVAMailer = require("./core/AVAMailer.js");
module.exports.AVAError = require("./core/AVAError.js");
module.exports.Util = require("./core/Util.js");
module.exports.CLI = require("./core/Operations.js");

// Super components
module.exports.AVAViewController = require("./core/structure/AVAViewController.js");
module.exports.AVAController = require("./core/structure/AVAController.js");
module.exports.AVAMiddleware = require("./core/structure/AVAMiddleware.js");
module.exports.AVAModel = require("./core/structure/AVAModel.js");

// Third-party
module.exports.hbs = require("hbs");