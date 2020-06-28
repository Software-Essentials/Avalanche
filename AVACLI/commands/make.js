import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { AFError } from "../../AVAFoundation/index";
import { UUID, ensureDirectoryExistence } from "../../AVAFoundation/AFUtil";
import * as ACUtil from "../../AVACore/ACUtil";

const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const { COPYFILE_EXCL } = fs.constants;


/**
 * @description Makes template.
 */
function make(component) {
  switch ((component || "").replace("\x1b[32m\x1b[1m", "")) {
    case "controller":
      make_controller();
      return;
    case "docs":
    case "documentation":
      make_documentation();
      return;
    case "env":
    case "environment":
      make_environment();
      return;
    case "mw":
    case "middleware":
      make_middleware();
      return;
    case "model":
      make_model();
      return;
    case "routes":
    case "route":
    case "routing":
      make_routes();
    case "population":
      make_population();
      return;
    case "localisation":
      make_localisation();
      return;
    case "view":
      make_view();
      return;
    default:
      make_default();
      return;
  }
}


/**
 * 
 */
function make_default() {
  var choices = [
    "\x1b[32m\x1b[1mmodel",
    "\x1b[32m\x1b[1mcontroller",
    "\x1b[32m\x1b[1mrouting",
    "\x1b[32m\x1b[1mmiddleware",
    "\x1b[32m\x1b[1mpopulation",
    "\x1b[32m\x1b[1mlocalisation",
    "\x1b[32m\x1b[1menvironment",
    "\x1b[32m\x1b[1mdocumentation"
  ];
  const prompt = {
    type: "list",
    name: "component",
    message: "What would you like to make?",
    choices: choices,
    prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
    suffix: "\x1b[0m"
  };
  inquirer.prompt(prompt).then(answers => {
    make(answers.component);
    return;
  });
}


/**
 * 
 */
function make_controller() {
  var lastTry = "";
  var overwrite = false;
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your controller:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (!answer.endsWith("Controller"))
          return `\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`;
        if (fs.existsSync(`${projectPWD}/app/controllers/${answer}.js`)) {
          if (lastTry === answer) {
            overwrite = true;
          } else {
            lastTry = answer;
            return "\x1b[31mA controller with this name already exists. \x1b[1m(Press enter again to overwrite)\x1b[0m";
          }
        }
        return true;
      }
    },
    {
      type: "list",
      name: "model",
      choices: ["\x1b[1m\x1b[3m\x1b[33mDon't base off a model\x1b[0m"].concat(ACUtil.getModels()),
      message: "Choose a model:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m"
    }//,
    // {
    //   type: "checkbox",
    //   name: "actions",
    //   message: "Choose what actions you want:",
    //   choices: [
    //     "index",
    //     "show",
    //     "store",
    //     "update",
    //     "destroy"
    //   ],
    //   default: [
    //     "index",
    //     "show",
    //     "store",
    //     "update",
    //     "destroy"
    //   ],
    //   prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
    //   suffix: "\x1b[0m"
    // },
    // {
    //   type: "list",
    //   name: "routes",
    //   message: "Do you want to automaticly generate routes?",
    //   choices: ["Add to existing routes file", "Create new routes file", "Don't generate routes"],
    //   prefix: "\x1b[32m[AVALANCHE]\x1b[3m",
    //   suffix: "\x1b[0m"
    // }
  ];
  inquirer.prompt(questions).then(answers => {
    const model = ACUtil.getModels().includes(answers.model) ? answers.model : null;
    const modelName = model == null ? "Entity" : model.split("-").join("_");
    const importLine = model == null ? `// import Entity from "../models/Entity";` : `import ${modelName} from "../models/${model}";`;
    const descriptionLine = `\n * @description ${model == null ? "Manages requests" : `Manages requests regarding the ${model} model`}.`;
    const authorLine = pkg.author ? `\n * @author ${pkg.author}` : "";
    const variables = {
      import: importLine,
      description: descriptionLine,
      author: authorLine,
      name: answers.name,
      model: modelName,
      model_lowercase: modelName.toLowerCase()
    };
    makeTemplate(variables, "TEMPLATE_controller", `app/controllers/${answers.name}.js`, true);
    // makeTemplate(variables, "TEMPLATE_route", `app/controllers/${answers.name}.js`);
  });
}


/**
 * 
 */
function make_environment() {
  const questions = [
    {
      type: "input",
      name: "filename",
      message: "Name your environment file:",
      default: "development",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/environments/${answer}.environment.json`))
          return "\x1b[31mAn environment file with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "input",
      name: "name",
      message: "Name your application title for this environment:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/environments/${answer}.environment.json`))
          return "\x1b[31mAn environment file with this name already exists.\x1b[0m"
        return true;
      }
    }
  ];
  const string = new UUID().string.split("-").join("");
  var secret = []
  for (const character of string) {
    secret.push(Math.round(Math.random()) ? character.toLowerCase() : character.toUpperCase());
  }
  secret = secret.join("");
  inquirer.prompt(questions).then(answers => {
    const path = `app/environments/${answers.filename}.environment.json`;
    const template = "TEMPLATE_environment";
    const variables = {
      name: answers.name,
      secret: secret
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_middleware() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your middleware:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/middleware/${answer}.js`))
          return "\x1b[31mA middleware file with this name already exists.\x1b[0m"
        return true;
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/middleware/${answers.name}.js`;
    const template = "TEMPLATE_middleware";
    const variables = {
      name: answers.name
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_model() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your model:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/models/${answer}.js`))
          return "\x1b[31mA model with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "input",
      name: "table",
      message: "Name your table:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      default: (answers) => {
        return answers.name;
      },
      validate: (answer) => {
        return answer.length >= 2 ? true : "Model name should be atleast 2 characters";
      }
    },
    {
      type: "list",
      name: "identificationMethod",
      choices: ["ID (Auto increment)", "UUID", "none"],
      message: "Choose model identifier:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m"
    },
    {
      type: "list",
      name: "method",
      choices: ["AFDatabase", "AFStorage (deprecated)"],
      message: "Choose a storage method:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/models/${answers.name}.js`;
    const template = "TEMPLATE_model";
    const identificationMethod = answers.identificationMethod === "ID (Auto increment)" ? "ID" : answers.identificationMethod
    const name = answers.name;
    var lineImportAvacore = `import { AFModel } from "avacore";`;
    var lineConstUUID = ``;
    var lineIdenifier = `    // this.IDENTIFIER = "ID";`;
    var lineComputedDefault = "";
    var linePropertyID = "";
    const prefix = name.match(/[A-Z][a-z]+/g);
    const columnPrefix = prefix[prefix.length - 1].toLowerCase();
    if (identificationMethod === "UUID") {
      lineImportAvacore = `import { AFModel, AFUtil } from "avacore";`;
      lineConstUUID = `\nconst { UUID } = AFUtil;\n`;
      lineIdenifier = `    this.IDENTIFIER = "ID";`;
      lineComputedDefault = "\n    this.ID = new UUID().string;";
      linePropertyID = `\n      "ID": {\n        name: "${columnPrefix}_id",\n        type: "UUID",\n        required: true\n      },`;
    }
    if (identificationMethod === "ID") {
      lineIdenifier = `    this.IDENTIFIER = "ID";`;
      linePropertyID = `\n      "ID": {\n        name: "${columnPrefix}_id",\n        type: "INT",\n        length: 10,\n        relatable: true,\n        autoIncrement: true,\n        required: true\n      },`;
    }
    const variables = {
      name: name,
      column_prefix: columnPrefix,
      name_lower: name.toLowerCase(),
      method: answers.method,
      method_key: answers.method === "AFStorage (deprecated)" ? "STORAGE" : "DATABASE",
      line_import_avacore: lineImportAvacore,
      line_const_uuid: lineConstUUID,
      line_idenifier: lineIdenifier,
      line_computed_default: lineComputedDefault,
      line_property_id: linePropertyID
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_routes() {
  const questions = [
    {
      type: "input",
      name: "filename",
      message: "Name your routes file:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/routes/${answer}.json`))
          return "\x1b[31mA routes file with this name already exists.\x1b[0m"
        return true;
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/routes/${answers.filename}.json`;
    const template = "TEMPLATE_routes";
    const variables = {};
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_population() {
  const questions = [
    {
      type: "input",
      name: "filename",
      message: "Name your population file:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/migration/population/${answer}.json`))
          return "\x1b[31mA population file with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "list",
      name: "model",
      choices: ACUtil.getModels(),
      message: "Choose a model:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/migration/population/${answers.filename}.json`;
    const template = "TEMPLATE_seeds";
    const DummyClass = require(`${projectPWD}/app/models/${answers.model}.js`).default;
    const variables = {
      model: answers.model,
      method: new DummyClass().METHOD === "DATABASE" ? "table" : "zone"
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_localisation() {
  const questions = [
    {
      type: "input",
      name: "filename",
      message: "Name your localisation file:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      default: "en_GB",
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (fs.existsSync(`${projectPWD}/app/localisations/${answer}.json`))
          return "\x1b[31mThis localisation already exists in your project.\x1b[0m"
        return true;
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/localisations/${answers.filename}.json`;
    const template = "TEMPLATE_localisation";
    const variables = {};
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_documentation() {
  const filename = "API Documentation.md";
  if (fs.existsSync(filename)) {
    const questions = [
      {
        type: "confirm",
        name: "overwrite",
        message: "Do you want to overwrite the existing Documentation file?",
        prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
        default: false,
        suffix: "\x1b[0m"
      }
    ];
    inquirer.prompt(questions).then(answers => {
      if (answers.overwrite === true) {
        generate();
        return;
      }
      console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) Aborting.\x1b[0m`);
    });
    return;
  }
  generate();
  function generateDescription(endpoint) {
    const filePath = `${projectPWD}/app/controllers/${endpoint.controller}.js`;
    const comments = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, { encoding: "utf8" });
      for (const codeSections of fileData.split("/**")) {
        const codeSection = codeSections.split("(")[0];
        if (!codeSection.includes("*/")) {
          continue;
        }
        const handlerMeta = codeSection.split("*/")
        const comment = handlerMeta[0].trim().split("*").join(" ").split("\n").join(" ").split("\t").join(" ").replace(/  +/g, " ");
        const handler = handlerMeta[1].trim();
        if (!comment.includes("@description")) {
          continue;
        }
        if (handler !== endpoint.handler) {
          continue;
        }
        comments.push(comment);
      }
    }
    const comment = comments.join(" ");
    const description = comment ? comment.split("@description")[1].split("@")[0] : "";
    return description;
  }
  function generate() {
    const sections = [`# API Documentation\n*Generated on ${new Date().toDateString()}*`];
    const routes = [];
    for (const route of ACUtil.getRoutes()) {
      if (Object.keys(route.domains).includes("*")) {
        const endpoint = route.domains["*"];
        endpoint.method = route.method;
        endpoint.path = `*${route.path}`;
        endpoint.description = generateDescription(endpoint);
        routes.push(endpoint);
      }
      for (const domain of Object.keys(route.domains)) {
        const endpoint = route.domains[domain];
        endpoint.method = route.method;
        endpoint.path = `${domain}${route.path}`;
        endpoint.description = generateDescription(endpoint);
        routes.push(endpoint);
      }
    }
    routes.sort((a, b) => (a.path > b.path) ? 1 : ((b.path > a.path) ? -1 : 0));
    for (const route of routes) {
      const section = [];
      section.push(`---\n## \`${route.method} ${route.path}\``);
      if (route.description) {
        section.push(`**Description:**&nbsp;&nbsp;${route.description}`);
      }
      section.push(`**Handler:**&nbsp;&nbsp;\`${route.handler ? `${route.controller}.${route.handler}` : route.controller}\``);
      if (Array.isArray(route.middleware)) {
        section.push(`**Middleware:**\n - ${route.middleware.join("\n - ")}`);
      }
      sections.push(section.join("\n\n"));
    }
    fs.writeFileSync(filename, sections.join("\n\n\n"));
    console.log(`${ACUtil.terminalPrefix()}\x1b[32m Documentation file created!\x1b[0m`);
  }
}


/**
 * @deprecated
 */
function make_view() {
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your view:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if (!answer.endsWith("ViewController"))
          return `\x1b[31mA voew name should end with "ViewController". For example: "ProfileViewController".\x1b[0m`;
        if (fs.existsSync(`${projectPWD}/app/views/${answer}.js`))
          return "\x1b[31mA view with this name already exists.\x1b[0m";
        return true;
      }
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/views/${answers.name}.js`;
    const template = "TEMPLATE_view";
    const variables = { name: answers.name };
    makeTemplate(variables, template, path);
  });
}


/**
 * @description Renders the template file.
 * @param {Object} variables 
 * @param {String} template 
 * @param {String} path 
 */
function makeTemplate(variables, template, projectPath) {
  const overwrite = arguments[3] === true ? true : false;
  const src = path.normalize(`${__dirname}/../../AVACore/templates/${template}`);
  const dest = path.normalize(`${projectPWD}/${projectPath}`);
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest) && overwrite) {
      fs.unlinkSync(dest);
    }
    if (!fs.existsSync(dest)) {
      ensureDirectoryExistence(dest);
      fs.copyFile(src, dest, COPYFILE_EXCL, (error) => {
        if (error) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}\x1b[0m`);
          return;
        }
        var content = fs.readFileSync(dest).toString();
        for (const key in variables) {
          const variable = variables[key];
          content = content.split(`<#${key}?>`).join(variable);
        }
        fs.writeFileSync(dest, content, { encoding: "utf8" });
        console.log(`${ACUtil.terminalPrefix()}\x1b[32m Done.\x1b[0m`);
      });
    } else {
      if (overwrite) {
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) Unable to replace file!\x1b[0m`);
      } else {
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) This file already exists!\x1b[0m`);
      }
    }
  } else {
    console.log(`${ACUtil.terminalPrefix()}\x1b[31m (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
    process.exit(AFError.INCOMPLETECORE);
  }
}


module.exports.execute = make;
module.exports.enabled = true;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "make";
module.exports.description = "Creates a component.";