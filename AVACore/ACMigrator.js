import fs from "fs";
import { terminalPrefix, getModels } from "./ACUtil";
import { AFDatabase, AFStorage, AFRecordZone } from "../AVAFoundation/index";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACMigrator {

  constructor() {

  }


  migrate(mode, callback) {
    switch (mode) {
      case "SAFE": this.execute({ wipe: false, force: false, onReady: callback }); break;
      case "OVERWRITE": this.execute({ wipe: false, force: true, onReady: callback }); break;
      case "WIPE": this.execute({ wipe: true, force: true, onReady: callback }); break;
    }
  }


  execute(options) {
    const ready = options ? typeof options.onReady === "function" ? options.onReady : () => { } : () => { };
    const force = options ? typeof options.force === "boolean" ? options.force : false : false;
    const wipe = options ? typeof options.wipe === "boolean" ? options.wipe : false : false;
    const models = getModels();
    const database = new AFDatabase();
    database.foreignKeyChecks = false;
    const storage = new AFStorage();
    var migrations = {};
    if (wipe) {
      console.log(`${terminalPrefix()}\x1b[32m Wiping tables...\x1b[0m`);
      database.dropAllTables({
        onSuccess: ({ total, success }) => {
          console.log(`${terminalPrefix()}\x1b[32m Wipe complete. (${total}/${success} tables dropped)\x1b[0m`);
          migrate();
        },
        onFailure: ({ error }) => {
          switch (error.code) {
            case "ER_NOT_SUPPORTED_AUTH_MODE":
              console.log(`${terminalPrefix()}\x1b[31m (error) Database doesn't support authentication protocol. Consider upgrading your database.\x1b[0m`);
              break;
            case "ER_ACCESS_DENIED_ERROR":
              console.log(`${terminalPrefix()}\x1b[31m (error) Access to database was denied.\x1b[0m`);
              break;
            default:
              console.log(`${terminalPrefix()}\x1b[31m (error) \x1b[0m${error.message}`);
          }
        }
      });
    } else {
      migrate();
    }
    function migrate() {
      console.log(`${terminalPrefix()}\x1b[32m Migrating...\x1b[0m`)
      for (const i in models) {
        const model = models[i];
        migrations[model] = null;
        const path = `${projectPWD}/app/models/${model}.js`;
        if (fs.existsSync(path)) {
          const Model = require(path).default;
          if (Model.METHOD === "DATABASE") {
            var properties = [];
            var options = {
              force: force,
              onSuccess: ({ table }) => {
                migrations[table] = true;
                update();
              },
              onFailure: ({ table, error }) => {
                migrations[table] = false;
                if (error) {
                  console.log(`${terminalPrefix()}\x1b[31m (error) Migration failed:\x1b[0m ${error.message}`);
                }
                update();
              }
            };
            if (Model.PROPERTIES[Model.IDENTIFIER]) {
              options.primaryKey = Model.PROPERTIES[Model.IDENTIFIER].name;
            }
            for (const key of Object.keys(Model.PROPERTIES)) {
              properties.push(Model.PROPERTIES[key]);
            }
            database.createTable(Model.NAME, properties, options);
          }
          if (Model.METHOD === "STORAGE") {
            if (!storage.recordZoneExists(Model.NAME)) {
              storage.addRecordZone(new AFRecordZone(this.NAME, []));
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
      for (const key in migrations) {
        if (migrations[key] !== null) completed++;
        if (migrations[key]) successful++;
      }
      if (completed === Object.keys(migrations).length) {
        console.log(`${terminalPrefix()}\x1b[32m Migration complete. (${completed}/${successful} tables/zones migrated)\x1b[0m`);
        ready(true);
      }
    }
  }

}


export default ACMigrator;