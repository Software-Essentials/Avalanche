const fs = require("fs");
const CoreUtil = require("./CoreUtil")
const { AVADatabase, AVAStorage } = require("../index");


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
  

  seed(mode, callback) {
    switch (mode) {
      case "SAFE": this.execute({ wipe: false, onReady: callback }); break;
      case "WIPE": this.execute({ wipe: true, onReady: callback }); break;
      case "OVERWRITE": this.execute({ wipe: false, onReady: callback }); break;
    }
  }


  /**
   * @description Wipes the data in the storage and database. Then seeds.
   */
  execute(options) {
    const ready = options ? typeof options.onReady === "function" ? options.onReady : () => {} : () => {};
    const wipe = options ? typeof options.wipe === "boolean" ? options.wipe : false : false;
    console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Seeding...\x1b[0m`);
    var permissionIssue = false;
    if(wipe) {
      try {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Storage wiped.\x1b[0m`);
        AVAStorage.wipe();
      } catch (error) {
        if (error.code === "EPERM") {
          permissionIssue = true;
        } else {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error)\x1b[0m ${error}`);
        }
      }
    }
    var seedStats = {};
    for (let i = 0; i < this.seeds.length; i++) {
      const seed = this.seeds[i];
      if (seed.hasOwnProperty("zone")) {
        seedStats[seed.zone] = null;
        const path = `${projectPWD}/storage/${seed.zone}.json`;
        fs.writeFileSync(path, JSON.stringify(seed.data, null, 2));
        seedStats[seed.zone] = true;
        update();
      }
      if (seed.hasOwnProperty("table")) {
        seedStats[seed.table] = null;
        const database = new AVADatabase();
        const options = { force: true,
          onSuccess: ({table}) => {
            seedStats[table] = true;
            update();
          },
          onFailure: ({table}) => {
            seedStats[table] = false;
            update();
          }
        };
        database.insertInto(seed.table, seed.data, options);
      }
    }
    if(permissionIssue) {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[33m (warning) Some files or folders weren't deleted because Avalanche doesn't have the right permissions.\x1b[0m`);
    }
    function update() {
      var completed = 0;
      var successful = 0;
      for(const key in seedStats) {
        if (seedStats[key] !== null) completed++;
        if (seedStats[key]) successful++;
      }
      if (completed === Object.keys(seedStats).length) {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Seeding complete. (${completed}/${successful} tables seeded)\x1b[0m`);
        ready(true);
      }
    }
  }

}


module.exports = Seeder;