import fs from "fs";
import readline from "readline";
import { terminalPrefix, getModels, progressAnimation } from "./ACUtil";
import { AFDatabase, AFStorage, AFRecordZone } from "../AVAFoundation/index";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class ACMigrator {

  constructor() {

  }


  async migrate(mode, callback) {
    switch (mode) {
      case "SAFE": await this.execute({ wipe: false, force: false, onReady: callback }); break;
      case "OVERWRITE": await this.execute({ wipe: false, force: true, onReady: callback }); break;
      case "WIPE": await this.execute({ wipe: true, force: true, onReady: callback }); break;
    }
  }


  async execute(options) {
    const ready = options ? typeof options.onReady === "function" ? options.onReady : () => { } : () => { };
    const force = options ? typeof options.force === "boolean" ? options.force : false : false;
    const wipe = options ? typeof options.wipe === "boolean" ? options.wipe : false : false;
    const models = getModels();
    const database = new AFDatabase(environment.getDBCredentials());
    database.foreignKeyChecks = false;
    const storage = new AFStorage();
    var migrations = {};
    try {
      if (wipe) {
        const animation = progressAnimation("\x1b[34mWiping tables");
        await database.dropAllTables({
          onSuccess: async ({ total, success }) => {
            clearInterval(animation);
            console.log(`${terminalPrefix()}\x1b[32m Wipe complete. (${total}/${success} tables dropped)\x1b[0m`);
          },
          onFailure: ({ error }) => {
            clearInterval(animation);
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
      }
      await migrate();
    } catch (error) {
      console.log(error);
    }
    var animation;
    async function migrate() {
      animation = progressAnimation(`\x1b[34mMigrating (0/${models.length})`);
      for (const i in models) {
        const model = models[i];
        const path = `${projectPWD}/app/models/${model}.js`;
        if (fs.existsSync(path)) {
          const Model = require(path).default;
          migrations[Model.NAME] = null;
        }
      }
      for (const i in models) {
        const model = models[i];
        const path = `${projectPWD}/app/models/${model}.js`;
        if (fs.existsSync(path)) {
          const Model = require(path).default;
          if (Model.METHOD === "DATABASE") {
            var properties = [];
            var options = { force: force };
            if (Model.PROPERTIES[Model.IDENTIFIER]) {
              options.primaryKey = Model.PROPERTIES[Model.IDENTIFIER].name;
            }
            options.propertyKeys = {};
            for (const key of Object.keys(Model.PROPERTIES)) {
              options.propertyKeys[Model.PROPERTIES[key].name] = key
              properties.push(Model.PROPERTIES[key]);
            }
            try {
              const { table } = await database.createTable(Model.NAME, properties, options);
              migrations[table] = true;
            } catch ({ table, error }) {
              migrations[table] = false;
              if (error) {
                console.log(`${terminalPrefix()}\x1b[31m (error) Migration failed:\x1b[0m ${error.message}`);
              }
            }
            update({ table: Model.NAME });
            await new Promise((resolve, reject) => { setTimeout(() => { resolve(); }, 50) }); // Wait for a bit
          }
          if (Model.METHOD === "STORAGE") {
            if (!storage.recordZoneExists(Model.NAME)) {
              storage.addRecordZone(new AFRecordZone(this.NAME, []));
            }
            migrations[Model.NAME] = true;
            update({ table: Model.NAME });
          }
        }
      }
    }
    function update({ table }) {
      var completed = 0;
      var successful = 0;
      for (const key in migrations) {
        if (migrations[key] !== null) completed++;
        if (migrations[key] === true) successful++;
      }
      clearInterval(animation);
      animation = progressAnimation(`\x1b[34mMigrating (${successful}/${completed})${table ? ` [${table}]` : ""}                              `);
      if (completed === Object.keys(migrations).length) {
        database.foreignKeyChecks = true;
        clearInterval(animation);
        console.log(`${terminalPrefix()}\x1b[32m Migration complete. (${successful}/${completed} tables/zones migrated)\x1b[0m`);
        ready(true);
      }
    }
  }

}


export default ACMigrator;