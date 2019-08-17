const fs = require("fs");
const CoreUtil = require("./CoreUtil");
const { AVADatabase, AVAStorage, AVARecordZone } = require("../index");
const projectPWD = process.env.PWD;


class Migrator {

  constructor() {

  }

  migrate(mode, callback) {
    switch (mode) {
      case "SAFE": this.execute({ wipe: false, force: false, onReady: callback }); break;
      case "WIPE": this.execute({ wipe: true, force: true, onReady: callback }); break;
      case "OVERWRITE": this.execute({ wipe: false, force: true, onReady: callback }); break;
    }
  }

  execute(options) {
    const ready = options ? typeof options.onReady === "function" ? options.onReady : () => {} : () => {};
    const force = options ? typeof options.force === "boolean" ? options.force : false : false;
    const wipe = options ? typeof options.wipe === "boolean" ? options.wipe : false : false;
    const models = CoreUtil.getModels();
    const database = new AVADatabase();
    const storage = new AVAStorage();
    var migrations = {};
    if (wipe) {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Wiping tables...\x1b[0m`);
      database.wipeAllTables({
        onSuccess: ({total, success}) => {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Wipe complete. (${total}/${success} tables dropped)\x1b[0m`);
          migrate();
        },
        onFailure: ({error}) => {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) \x1b[0m ${error.message}`);
        }
      });
    } else {
      migrate();
    }
    function migrate() {
      console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Migrating...\x1b[0m`)
      for (const i in models) {
        const model = models[i];
        migrations[model] = null;
        const path = `${projectPWD}/app/models/${model}.js`;
        if (fs.existsSync(path)) {
          const Model = require(path);
          if (Model.METHOD === "DATABASE") {
            var properties = [];
            const options = { force: force,
              onSuccess: ({table}) => {
                migrations[table] = true;
                update();
              },
              onFailure: ({table, error}) => {
                migrations[table] = false;
                if (error) {
                  console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Migration failed:\x1b[0m ${error.message}`);
                }
                update();
              }
            };
            for (const key of Object.keys(Model.PROPERTIES)) {
              properties.push(Model.PROPERTIES[key]);
            }
            database.createTable(Model.NAME, properties, options);
          }
          if (Model.METHOD === "STORAGE") {
            if(!storage.recordZoneExists(Model.NAME)) {
              storage.addRecordZone(new AVARecordZone(this.NAME, []));
            }
            migrations[Model.NAME] = true;
            update();
          }
        }
      }
    }
    function update() {
      var completed = 0;
      var successful = 0;
      for(const key in migrations) {
        if (migrations[key] !== null) completed++;
        if (migrations[key]) successful++;
      }
      if (completed === Object.keys(migrations).length) {
        console.log(`${CoreUtil.terminalPrefix()}\x1b[32m Migration complete. (${completed}/${successful} tables/zones migrated)\x1b[0m`);
        ready(true);
      }
    }
  }

}


module.exports = Migrator;