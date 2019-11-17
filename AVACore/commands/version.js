const pkg = require(`${__dirname}/../../package.json`);


/**
 * @description Prints the version.
 */
function version() {
  if (pkg && pkg.version) {
    console.log(`v${pkg.version}`);
  }
}


module.exports.execute = version;
module.exports.enabled = true;
module.exports.scope = "GLOBAL";
module.exports.command = "version";
module.exports.description = "Prints your current version of Avalanche.";