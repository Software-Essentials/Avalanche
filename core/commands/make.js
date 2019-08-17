const projectPWD = process.env.PWD;
const fs = require("fs");
const inquirer = require("inquirer");
const { AVAError } = require("../../index.js");
const { COPYFILE_EXCL } = fs.constants;
const CoreUtil = require("../CoreUtil");


/**
 * @description Makes controller.
 */
function make(component) {
  switch(component) {
    case "controller":
      make_controller();
      return;
    case "view":
      make_view();
      return;
    case "model":
      make_model();
      return;
    default:
      make_default();
      return;
  }
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
      choices: ["AVAStorage", "AVADatabase"],
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
      name_lower: answers.name.toLowerCase()
    };
    makeTemplate(variables, template, path);
  });
}


/**
 * 
 */
function make_default() {
  var choices = [
    "controller",
    "model",
    "view"
  ];
  const prompt = {
    type: "list",
    name: "component",
    message: "What would you like to make?",
    default: 0,
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
 * @description Renders the template file.
 * @param {Object} variables 
 * @param {String} template 
 * @param {String} path 
 */
function makeTemplate(variables, template, path) {
  const src = `${__dirname}/../templates/${template}`;
  const dest = `${projectPWD}/${path}`;
  if(fs.existsSync(src)) {
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
      var content = fs.readFileSync(dest).toString();
      for(const key in variables) {
        const variable = variables[key];
        content = content.split(`<#${key}?>`).join(variable);
      }
      fs.writeFileSync(dest, content, { encoding: "utf8" });
      console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Done.\x1b[0m`);
    } else {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) This file already exists!\x1b[0m`);
    }
  } else {
    console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (fatal error) No prefabs found. You might need to reinstall Avalanche.\x1b[0m`);
    process.exit(AVAError.INCOMPLETECORE);
  }
}


module.exports.execute = make;
module.exports.command = "make";
module.exports.description = "Creates a component.";