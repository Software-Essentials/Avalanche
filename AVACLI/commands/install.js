import { AVAError } from "../../AVAFoundation/index";
import Installer from "../../AVACore/Installer";
import { terminalPrefix } from "../../AVACore/CoreUtil";


/**
 * @description Sets up the project structure
 */
function install(pkg) {
  console.log(`${terminalPrefix()}\x1b[32m Installing package.\x1b[0m`);
  const onSuccess = () => {
    console.log(`${terminalPrefix()}\x1b[32m Installation done!\x1b[0m`);
  };
  const onFailure = ({ error, message }) => {
    if (message || error) {
      console.log(`${terminalPrefix()}\x1b[31m ${error ? error.message : message}\x1b[0m`);
    }
    process.exit(AVAError.INCOMPLETECORE);
  };
  const onOutput = (message) => {
    if (message) {
      console.log(`${terminalPrefix()}\x1b[32m ${message}\x1b[0m`);
    }
  };
  if (typeof pkg === "string" && pkg !== "") {
    const installer = new Installer();
    installer.install({ package: pkg, onSuccess, onFailure, onOutput });
  } else {
    onFailure({ message: "Specify a package!" });
  }
}


module.exports.execute = install;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "install";
module.exports.description = "Addes auth files.";