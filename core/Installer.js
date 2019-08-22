const fs = require("fs");
const { execSync } = require("child_process");
const projectPackage = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;


class Installer {

  constructor() {

  }

  install(options) {
    const onFailure = options ? typeof options.onFailure === "function" ? options.onFailure : () => {} : () => {};
    const onSuccess = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => {} : () => {};
    const onOutput = options ? typeof options.onOutput === "function" ? options.onOutput : () => {} : () => {};
    const example = options ? typeof options.package === "string" ? options.package : null : null;
    var boilerplate = {};
    const path = `${__dirname}/installs/${example}.json`;
    if(typeof example === "string" && fs.existsSync(path)) {
      boilerplate = require(path);
    } else {
      onFailure({message: "Package not found."});
      return;
    }
    onOutput("Copying files.");
    for (const file of boilerplate.files) {
      const templatePath = `${__dirname}/templates/${file.template}`;
      const filePath = `${projectPWD}${file.path}`;
      if (fs.existsSync(templatePath)) {
        try {
          const folders = file.path.split("/");
          folders.pop();
          var branch = projectPWD;
          for (const i in folders) {
            const folder = folders[i];
            if (folder !== "") {
              branch = `${branch}/${folder}`;
              if (!fs.existsSync(branch)) {
                fs.mkdirSync(branch);
              }
            }
          }
          if (fs.existsSync(filePath)) {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) "${file.path}" overwritten.\x1b[0m`);
          }
          fs.copyFileSync(templatePath, filePath, fs.COPYFILE_EXCL);
        } catch (error) {
          if (error.code === "ENOENT") {
            console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) Unable to copy "${file.path}"!\x1b[0m`);
          }
        }
      }
    }
    for (const i in boilerplate.modules) {
      const moduleNaming = boilerplate.modules[i].split("@");
      const moduleVersion = moduleNaming[moduleNaming.length - 1];
      const moduleName = moduleNaming[moduleNaming.length - 2];
      if (!projectPackage.dependencies.hasOwnProperty(moduleName) || projectPackage.dependencies[moduleName] !== `^${moduleVersion}`) {
        try {
          onOutput(`Installing module '${moduleNaming.join("@")}'.`);
          execSync(`npm install ${moduleNaming.join("@")}`, { windowsHide: true, stdio: "ignore" });
          const dependency = JSON.parse(fs.readFileSync(`${projectPWD}/node_modules/${moduleName}/package.json`));
          if(!projectPackage.dependencies) {
            projectPackage.dependencies = {};
          }
          projectPackage.dependencies["avacore"] = `^${dependency.version}`;
        } catch (error) {
          onFailure({error, message: `Failed to install '${moduleName}'.`})
        }
      }
    }
    onSuccess();
  }

}


module.exports = Installer;