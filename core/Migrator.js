const fs = require("fs");
const CoreUtil = require("./CoreUtil");
const projectPWD = process.env.PWD;


class Migrator {

  constructor() {

  }

  migrate(mode) {
    switch (mode) {
      case "SAFE": this.migrate_safe(); break;
      case "WIPE": this.migrate_wipe(); break;
      case "OVERWRITE": this.migrate_overwrite(); break;
    }
  }

  migrate_safe() {
    const models = CoreUtil.getModels();
    for (const i in models) {
      const model = models[i];
      const path = `${projectPWD}/app/models/${model}.js`;
      if (fs.existsSync(path)) {
        const Model = require(path);
      }
    }
  }

  migrate_wipe() {
    
  }

  migrate_overwrite() {
    
  }

}


module.exports = Migrator;