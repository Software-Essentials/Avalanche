// General
module.exports.AVALocalisation = require("./core/AVALocalisation.js");
module.exports.AVANotification = require("./core/AVANotification.js");
module.exports.AVAEnvironment = require("./core/AVAEnvironment.js");
module.exports.AVARecordZoneType = require("./core/AVARecordZoneType.js");
module.exports.AVARecordZone = require("./core/AVARecordZone.js");
module.exports.AVADatabase = require("./core/AVADatabase.js");
module.exports.AVAStorage = require("./core/AVAStorage.js");
module.exports.AVAMailer = require("./core/AVAMailer.js");
module.exports.AVAError = require("./core/AVAError.js");

module.exports.Util = require("./core/Util.js");
module.exports._ = require("./core/AVALocalisation.js").translate;

// Super components
module.exports.AVAViewController = require("./core/AVAViewController.js");
module.exports.AVAController = require("./core/AVAController.js");
module.exports.AVAMiddleware = require("./core/AVAMiddleware.js");
module.exports.AVAModel = require("./core/AVAModel.js");

// Third-party
module.exports.hbs = require("hbs");