const fs = require("fs");
const CoreUtil = require("./CoreUtil")
const projectPWD = process.env.PWD;


class Seeder {

  constructor() {
    this.seeds = [];
    const seedFiles = CoreUtil.getSeedFilesNames();
    for (const i in seedFiles) {
      const fileName = seedFiles[i];
      const path = `${projectPWD}/app/migrations/seeds/${fileName}.json`;
      if (fs.existsSync(path)) {
        const fileSeeds = require(path);
        for(const i in fileSeeds) {
          this.seeds.push(fileSeeds[i]);
        }
      }
    }
  }

  seed(mode) {
    switch (mode) {
      case "SAFE": this.seed_safe(); break;
      case "WIPE": this.seed_wipe(); break;
      case "OVERWRITE": this.seed_overwrite(); break;
    }
  }

  seed_safe() {
    for (const i in this.seeds) {
      const seed = this.seeds[i];
      const path = `${projectPWD}/storage/${seed.table}.json`;
      if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(seed.data, null, 2));
      }
    }
  }

  seed_wipe() {
    const storagePath = `${projectPWD}/storage`;
    var permissionIssue = false;
    if (fs.existsSync(storagePath)) {
      const children = CoreUtil.directoryLooper(storagePath, []).children;
      var paths = [];
      for (const i in children) {
        const index = children.length - (1 + parseInt(i));
        paths.push(children[index]);
      }
      for (const i in paths) {
        const child = paths[i];
        try {
          fs.unlinkSync(child);
        } catch (error) {
          if (error.code === "EPERM") {
            permissionIssue = true;
          }
        }
      }
    }
    if(permissionIssue) {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) Some files or folders weren't deleted because Avalanche doesn't have the right permissions.\x1b[0m`);
    }
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }
    for (const i in this.seeds) {
      const seed = this.seeds[i];
      const path = `${storagePath}/${seed.table}.json`;
      fs.writeFileSync(path, JSON.stringify(seed.data, null, 2));
    }
  }

  seed_overwrite() {
    var permissionIssue = false;
    for (const i in this.seeds) {
      const seed = this.seeds[i];
      const path = `${projectPWD}/storage/${seed.table}.json`;
      try {
        fs.writeFileSync(path, JSON.stringify(seed.data, null, 2));
      } catch (error) {
        if (error.code === "EPERM") {
          permissionIssue = true;
        }
      }
    }
    if(permissionIssue) {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) Some files or folders weren't deleted because Avalanche doesn't have the right permissions.\x1b[0m`);
    }
  }

}


module.exports = Seeder;