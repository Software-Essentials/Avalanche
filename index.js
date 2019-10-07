// General
module.exports.AVALocalisation = require("./foundation/AVALocalisation.js");
module.exports.AVANotification = require("./foundation/AVANotification.js");
module.exports.AVAEnvironment = require("./foundation/AVAEnvironment.js");
module.exports.AVARecordZoneType = require("./foundation/AVARecordZoneType.js");
module.exports.AVARecordZone = require("./foundation/AVARecordZone.js");
module.exports.AVAValidator = require("./foundation/AVAValidator.js");
module.exports.AVADatabase = require("./foundation/AVADatabase.js");
module.exports.AVAStorage = require("./foundation/AVAStorage.js");
module.exports.AVAMailer = require("./foundation/AVAMailer.js");
module.exports.AVAError = require("./foundation/AVAError.js");

module.exports.Util = require("./core/Util.js");
module.exports._ = require("./foundation/AVALocalisation.js").translate;

// Super components
module.exports.AVAViewController = require("./foundation/AVAViewController.js");
module.exports.AVAController = require("./foundation/AVAController.js");
module.exports.AVAMiddleware = require("./foundation/AVAMiddleware.js");
module.exports.AVAModel = require("./foundation/AVAModel.js");