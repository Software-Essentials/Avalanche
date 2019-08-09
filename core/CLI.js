#!/usr/bin/env node

const projectPWD = process.env.PWD;
const program = require("commander");
const fs = require("fs");
const package = require(`${projectPWD}/package.json`);
const avalanchePackage = require("../package.json");

const { COPYFILE_EXCL } = fs.constants;
const folders = [
  "/app",
  "/app/controllers",
  "/app/environments",
  "/app/localisations",
  "/app/middleware",
  "/app/public",
  "/app/routes",
  "/app/templates",
  "/app/templates/emails",
  "/app/templates/layouts",
  "/app/templates/partials",
  "/app/views",
  "/app/helpers"
];
const files = [
  {
    src: "/core/components/environment",
    dest: "/app/environments/development.environment.json",
    standard: true
  },
  {
    src: "/core/components/helpers",
    dest: "/app/helpers/util.js",
    standard: true
  },
  {
    src: "/core/components/example1_controller",
    dest: "/app/controllers/MainController.js",
    template: "example1"
  },
  {
    src: "/core/components/example1_view",
    dest: "/app/views/MainViewController.js",
    template: "example1"
  },
  {
    src: "/core/components/example1_routes_api",
    dest: "/app/routes/api.json",
    template: "example1"
  },
  {
    src: "/core/components/example1_routes_web",
    dest: "/app/routes/web.json",
    template: "example1"
  },
  {
    src: "/core/components/example1_template",
    dest: "/app/templates/default.hbs",
    template: "example1"
  },
  {
    src: "/core/components/example1_template_layout",
    dest: "/app/templates/layouts/main.layout.hbs",
    template: "example1"
  },
  {
    src: "/core/components/example2_controller",
    dest: "/app/controllers/PostController.js",
    template: "example2"
  },
  {
    src: "/core/components/example2_routes",
    dest: "/app/routes/api.json",
    template: "example2"
  }
];

program
  .version("1.2.3")
  .arguments("<cmd> [env]")
  .action(function(cmd, env) {
    cmdValue = cmd;
    envValue = env;
  })
  .parse(process.argv)

program
  .command("init [example]")
  .description("Initializes your Avalanche project")
  .action(function() {
    // console.log("Initialize project");
    init();
  })
  .parse(process.argv);
  
program
  .command("run [environment]")
  .description("Runs your application")
  .action(function() {
    // console.log("Run application");
  })
  .parse(process.argv);

program
  .command("reload")
  .description("Reloads caches")
  .action(function() {
    // console.log("Reload application");
  })
  .parse(process.argv);

program
  .command("upgrade")
  .description("Upgrades Avalanche your project")
  .action(function() {
    // console.log("Upgrade project");
  })
  .parse(process.argv);

program
  .command("install")
  .description("Installes files in your project")
  .action(function() {
    // console.log("Install snippets");
  })
  .parse(process.argv);

program
  .command("make")
  .description("Creates a component in your project")
  .action(function() {
    // console.log("Make component");
  })
  .parse(process.argv);


if (typeof cmdValue !== "undefined") {
  if(typeof package.avalancheConfig === "undefined" && cmdValue !== "init" && cmdValue !== "version") {
    console.log("\x1b[31m%s\x1b[0m", `(error) This is not an Avalanche project. use "avalanche init" to initialize.`);
    process.exit();
  }
  switch(cmdValue) {
    case "init":
      init(envValue);
      break;
    case "run":
      run();
      break;
    case "routes":
      routes();
      break;
    case "upgrade":
      upgrade();
      break;
    case "fix":
      fix();
      break;
    case "version":
      console.log(avalanchePackage.version);
      break;
    default:
      console.log("\x1b[31m%s\x1b[0m", `[AVALANCHE] Command not recognised!`);
  }
} else {
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Hello, World! :)`);
}

function init() {
  if(typeof package.avalancheConfig === "object") {
    console.log("\x1b[31m%s\x1b[0m", "[AVALANCHE] (error) Project has already been initialized.");
    process.exit();
  }
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Initializing project...`);
  const example = typeof arguments[0] === "string" ? arguments[0] : null;
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  for (const file of files) {
    const src = `${projectPWD}${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest) && (file.standard === true || file.template === example)) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
    }
  }
  var file = package;
  // file.nodemonConfig = { ignore: ["/app/public/*"] };
  file.avalancheConfig = { preferredEnvironment: "development" };
  fs.writeFileSync("./package.json", JSON.stringify(file, null, 2));
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Project has been initialized successfully!`);
}

function run() {
  console.log("\x1b[32m%s\x1b[0m", `[AVALANCHE] Starting server...`);
  require("./Main.js");
}

function routes() {
  const normalizedPath = `${projectPWD}/app/routes`;
  var routes = [];
  fs.readdirSync(normalizedPath).forEach(function (file) {
      const extensions = file.split(".");
      if (extensions.length = 2) {
          if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
              const route = JSON.parse(JSON.stringify(require("../app/routes/" + file)));
              routes.push.apply(routes, route);
          }
      }
  });
  if(routes.length <= 0) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Can't show routes because there aren't any routes in the project.");
    return;
  }
  var string = "\x1b[1m++======================================================================\x1b[0m\n";
  for (const route of routes) {
    const path = route.path;
    const method = route.method;
    const controller = route.controller;
    const handler = typeof route.handler === "string" ? route.handler : null;
    const color =
      method === "GET" ? 32 :
      method === "POST" ? 33 :
      method === "PUT" ? 34 :
      method === "DELETE" ? 31 : 0
    string += `\x1b[1m||\x1b[0m [\x1b[${color}m\x1b[1m${method}\x1b[0m] \t \x1b[3m${path}\x1b[0m\t        \x1b[32m${controller}\x1b[0m${handler ? `.\x1b[33m${handler}\x1b[0m()` : ".\x1b[34mconstructor\x1b[0m" }\n`;
  }
  string += "\x1b[1m++======================================================================\x1b[0m";
  console.log(string);
}

function upgrade() {
  // Upgrade patterns not yet implemented.
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Checking for update...");
  console.log("\x1b[31m%s\x1b[0m", "[AVALANCHE] (error) No upgrade pattern found. Check the GitHub Wiki for more information.");
}

function fix() {
  console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Fixing project...");
  var fixedStructure = false;
  for (const folder of folders) {
    const path = `${projectPWD}${folder}`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
      fixedStructure = true;
    }
  }
  for (const file of files) {
    const src = `${__dirname}/..${file.src}`;
    const dest = `${projectPWD}${file.dest}`;
    if(fs.existsSync(src) && !fs.existsSync(dest) && file.standard === true) {
      fs.copyFileSync(src, dest, COPYFILE_EXCL);
      fixedStructure = true;
    }
  }
  if(fixedStructure) {
    console.log("\x1b[32m%s\x1b[0m", "[AVALANCHE] Restored project structure");
  }
}

function makeController() {
  const name = "TestController";
  const src = `${__dirname}/../core/components/TEMPLATE_controller`;
  const dest = `${projectPWD}/app/controllers/${name}.js`;

  if(fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest, COPYFILE_EXCL);
    // var file = require(dest);
  }
}
