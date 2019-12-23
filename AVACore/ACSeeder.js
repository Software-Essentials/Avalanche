import fs from "fs";
import readline from "readline";
import { terminalPrefix, getSeedFilesNames } from "./ACUtil";
import { AFDatabase, AFStorage } from "../AVAFoundation/index";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACSeeder {

  constructor() {
    this.seeds = [];
    const seedFiles = getSeedFilesNames();
    for (const i in seedFiles) {
      const fileName = seedFiles[i];
      const path = `${projectPWD}/app/migration/seeds/${fileName}.json`;
      if (fs.existsSync(path)) {
        const fileSeeds = require(path);
        for (const i in fileSeeds) {
          this.seeds.push(fileSeeds[i]);
        }
      }
    }
  }


  seed(mode, callback) {
    switch (mode) {
      case "SAFE": this.execute({ wipe: false, onReady: callback }); break;
      case "OVERWRITE": this.execute({ wipe: false, onReady: callback }); break;
      case "WIPE": this.execute({ wipe: true, onReady: callback }); break;
    }
  }


  /**
   * @description Wipes the data in the storage and database. Then seeds.
   */
  execute(options) {
    const ready = options ? typeof options.onReady === "function" ? options.onReady : () => { } : () => { };
    const wipe = options ? typeof options.wipe === "boolean" ? options.wipe : false : false;
    process.stdout.write(`${terminalPrefix()}\x1b[32m Populating...\x1b[0m`);
    readline.cursorTo(process.stdout, 0);
    var permissionIssue = false;
    const database = new AFDatabase();
    database.foreignKeyChecks = false;
    var seedStats = {};
    const that = this;
    if (wipe) {
      database.wipeAllData({
        onSuccess: proceed
      });
      try {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${terminalPrefix()}\x1b[32m Storage wiped.\x1b[0m`);
        AFStorage.wipe();
      } catch (error) {
        if (error.code === "EPERM") {
          // permissionIssue = true; // Should be uncommented, BUT the issue can't be resolved and the warning is very annoying.
        } else {
          console.log(`${terminalPrefix()}\x1b[31m (error)\x1b[0m ${error}`);
        }
      }
    } else {
      proceed();
    }
    function proceed() {
      if (that.seeds.length > 0) {
        for (let i = 0; i < that.seeds.length; i++) {
          const seed = that.seeds[i];
          if (seed.hasOwnProperty("zone")) {
            seedStats[seed.zone] = null;
            const path = `${projectPWD}/storage/${seed.zone}.json`;
            fs.writeFileSync(path, JSON.stringify(seed.data, null, 2));
            seedStats[seed.zone] = true;
            update();
          }
          if (seed.hasOwnProperty("table")) {
            seedStats[seed.table] = null;
            const options = {
              force: true,
              onSuccess: ({ table }) => {
                seedStats[table] = true;
                update();
              },
              onFailure: ({ table, error }) => {
                seedStats[table] = false;
                switch (error.code) {
                  case "ER_NOT_SUPPORTED_AUTH_MODE":
                    console.log(`${terminalPrefix()}\x1b[31m (error) Database doesn't support authentication protocol. Consider upgrading your database.\x1b[0m`);
                    break;
                  case "ER_ACCESS_DENIED_ERROR":
                    console.log(`${terminalPrefix()}\x1b[31m (error) Access to database was denied.\x1b[0m`);
                    break;
                  case "ER_NO_SUCH_TABLE":
                    console.log(`${terminalPrefix()}\x1b[31m (error) Table not found. Migrate before populating.\x1b[0m`);
                    break;
                  default:
                    console.log(`${terminalPrefix()}\x1b[31m (error) \x1b[0m${error.message}`);
                }
                update();
              }
            };
            database.insertInto(seed.table, seed.data, options);
          }
        }
      } else {
        update();
      }
      if (permissionIssue) {
        console.log(`${terminalPrefix()}\x1b[33m (warning) Some files or folders weren't deleted because Avalanche doesn't have the right permissions.\x1b[0m`);
      }
    }
    function update() {
      var completed = 0;
      var successful = 0;
      for (const key in seedStats) {
        if (seedStats[key] !== null) completed++;
        if (seedStats[key]) successful++;
      }
      if (completed === Object.keys(seedStats).length) {
        readline.cursorTo(process.stdout, 0);
        console.log(`${terminalPrefix()}\x1b[32m Populating complete. (${completed}/${successful} tables populated)\x1b[0m`);
        ready(true);
      }
    }
  }

}


export default ACSeeder;