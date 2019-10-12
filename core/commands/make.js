const fs = require("fs");
const inquirer = require("inquirer");
const AVAError = require("../../foundation/AVAError");
const { COPYFILE_EXCL } = fs.constants;
const CoreUtil = require("../CoreUtil");
const { UUID } = require("../Util");
const path = require("path");


/**
 * @description Makes template.
 */
function make(component) {
  switch(component) {
    case "controller":
      make_controller();
      return;
    case "environment":
      make_environment();
      return;
    case "middleware":
      make_middleware();
      return;
    case "model":
      make_model();
      return;
    case "routes":
      make_routes();
      return;
    case "seeds":
      make_seeds();
      return;
    case "view (DEPRECATED)":
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
    "controller",
    "environment",
    "middleware",
    "model",
    "routes",
    "seeds",
    "view (DEPRECATED)"
  ];
  const prompt = {
    type: "list",
    name: "component",
    message: "What would you like to make?",
    choices: choices,
    prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
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
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name your controller:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(!answer.endsWith("Controller"))
          return `\x1b[31mA controller name should end with "Controller". For example: "UserController".\x1b[0m`;
        if(fs.existsSync(`${projectPWD}/app/controllers/${answer}.js`))
          return "\x1b[31mA controller with this name already exists.\x1b[0m";
        return true;
      }
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
    const path = `app/controllers/${answers.name}.js`;
    const template = "TEMPLATE_controller";
    const variables = { name: answers.name };
    makeTemplate(variables, template, path);
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
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/environments/${answer}.environment.json`))
          return "\x1b[31mAn environment file with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "input",
      name: "name",
      message: "Name your application title for this environment:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/environments/${answer}.environment.json`))
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
      message: "Name your environment:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/middleware/${answer}.js`))
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
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/models/${answer}.js`))
          return "\x1b[31mA model with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "input",
      name: "table",
      message: "Name your zone/table:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
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
      name: "method",
      choices: ["AVAStorage", "AVADatabase"],
      message: "Choose a storage method:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/models/${answers.name}.js`;
    const template = "TEMPLATE_model";
    const variables = {
      name: answers.name,
      name_lower: answers.name.toLowerCase(),
      method: answers.method,
      method_key: answers.method === "AVAStorage" ? "STORAGE" : "DATABASE"
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
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/routes/${answer}.json`))
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
function make_seeds() {
  const questions = [
    {
      type: "input",
      name: "filename",
      message: "Name your seeds file:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(fs.existsSync(`${projectPWD}/app/migrations/seeds/${answer}.json`))
          return "\x1b[31mA seeds file with this name already exists.\x1b[0m"
        return true;
      }
    },
    {
      type: "list",
      name: "model",
      choices: CoreUtil.getModels(),
      message: "Choose a model:",
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const path = `app/migrations/seeds/${answers.filename}.json`;
    const template = "TEMPLATE_seeds";
    const DummyClass = require(`${projectPWD}/app/models/${answers.model}.js`);
    const variables = {
      model: answers.model,
      method: new DummyClass().METHOD === "DATABASE" ? "table": "zone"
    };
    makeTemplate(variables, template, path);
  });
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
      prefix: `${CoreUtil.terminalPrefix()}\x1b[3m`,
      suffix: "\x1b[0m",
      validate: (answer) => {
        if(!answer.endsWith("ViewController"))
          return `\x1b[31mA voew name should end with "ViewController". For example: "ProfileViewController".\x1b[0m`;
        if(fs.existsSync(`${projectPWD}/app/views/${answer}.js`))
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
  const src = path.normalize(`${__dirname}/../templates/${template}`);
  const dest = path.normalize(`${projectPWD}/${projectPath}`);
  if(fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      CoreUtil.ensureDirectoryExistence(dest);
      fs.copyFile(src, dest, COPYFILE_EXCL, (error) => {
        if (error) {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) ${error.message}\x1b[0m`);
          return;
        }
        var content = fs.readFileSync(dest).toString();
        for(const key in variables) {
          const variable = variables[key];
          content = content.split(`<#${key}?>`).join(variable);
        }
        fs.writeFileSync(dest, content, { encoding: "utf8" });
        console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Done.\x1b[0m`);
      });
    } else {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) This file already exists!\x1b[0m`);
    }
  } else {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
    process.exit(AVAError.INCOMPLETECORE);
  }
}


module.exports.execute = make;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "make";
module.exports.description = "Creates a component.";