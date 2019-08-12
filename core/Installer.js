const { execSync } = require("child_process");

function npmInstallPackage(packages, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  packages = Array.isArray(packages) ? packages : [packages];
  options = options || options;
  callback = callback || function() {};

  var args = [];
  if (options.save) args.push("-S");
  if (options.saveDev) args.push("-D");
  if (options.global) args.push("-g");
  if (options.cache) args.push("--cache-min Infinity");

  if (options.silent === false) {
    packages.forEach(function (dep) {
      process.stdout.write("pkg: " + dep + "\n")
    });
  }

  const cliArgs = ["npm i"].concat(args, packages).join(" ");
  try {
    execSync(cliArgs, { windowsHide: true, stdio: "ignore" });
  } catch (error) {
    callback(error);
  }
}

module.exports = npmInstallPackage;