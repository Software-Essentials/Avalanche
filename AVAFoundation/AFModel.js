import { AFStorage, AFRecordZone, AFDatabase, AFError } from "../index";
import * as ACUtil from "../AVACore/ACUtil";
import { callbackPromise } from "nodemailer/lib/shared";


/**
 * @description Super model
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFModel {

  /**
   * @param {String} name Name of the resource.
   */
  constructor() {
    if (typeof arguments[0] === "string" && typeof arguments[1] === "string" && typeof arguments[2] === "object") {
      this.NAME = arguments[0];
      this.IDENTIFIER = arguments[1];
      this.PROPERTIES = arguments[2];
      this.METHOD = "STORAGE";
      this.DRAFT = false;
    }
    if (typeof arguments[0] === "object" && arguments[0] instanceof AFModel, typeof arguments[1] === "function") {
      const self = arguments[0];
      this.NAME = self.NAME;
      this.IDENTIFIER = self.IDENTIFIER;
      this.PROPERTIES = self.PROPERTIES;
      this.METHOD = self.METHOD;
      this.DRAFT = self.DRAFT
      this.PROMISE = arguments[1];
    }
  }


  /**
   * 
   */
  setupDone() {
    if (this.METHOD === "DATABASE") {
      if (typeof arguments[0] === "object") {
        const object = arguments[0];
        for (const key in this.PROPERTIES) {
          if (object.hasOwnProperty(this.PROPERTIES[key].name) === false) {
            throw new AFError("Model incomplete");
          }
          this[key] = object[this.PROPERTIES[key].name]
        }
      } else {
        for (const key in this.PROPERTIES) {
          this[key] = null;
        }
        this.DRAFT = true;
      }
    }
    if (this.METHOD === "STORAGE") {
      const storage = new AFStorage();
      if (!storage.recordZoneExists(this.NAME)) {
        storage.addRecordZone(new AFRecordZone(this.NAME, []));
      }
      if (typeof arguments[0] === "object") {
        const object = arguments[0];
        for (const key in this.PROPERTIES) {
          if (object.hasOwnProperty(this.PROPERTIES[key].name) === false) {
            throw new AFError("Model incomplete");
          }
          this[key] = object[this.PROPERTIES[key].name]
        }
      } else {
        for (const key in this.PROPERTIES) {
          this[key] = null;
        }
        this.DRAFT = true;
      }
    }
  }


  /**
   * 
   */
  save(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (this.METHOD === "DATABASE") {
      const database = new AFDatabase();
      var keys = [];
      var values = [];
      var parameters = [];
      for (const key in this.PROPERTIES) {
        const value = this[key];
        switch (typeof value) {
          case "string":
            parameters.push(value);
            values.push("?");
            break;
          case "number":
            parameters.push(value);
            values.push("?");
            break;
          case "boolean":
            parameters.push(value ? 1 : 0);
            values.push("?");
            break;
          default:
            continue;
        }
        keys.push(this.PROPERTIES[key].name);
      }
      var setString = "";
      var merged = keys.reduce((object, key, index) => {
        object[key] = values[index];
        return object;
      }, {});
      for (const key in merged) {
        if (key !== this.PROPERTIES[this.IDENTIFIER].name) {
          parameters.push(merged[key]);
          if (setString === "") {
            setString = `${key} = ?`;
          } else {
            setString = `${setString}, ${key} = ?`;
          }
        }
      }
      var query = "";
      if (this.DRAFT) {
        query = `INSERT INTO \`${this.NAME}\` (${keys.join(", ")}) VALUES (${values.join(", ")})`;
      } else {
        query = `UPDATE \`${this.NAME}\` SET ${setString} WHERE ${this.PROPERTIES[this.IDENTIFIER].name} = ${this[this.IDENTIFIER]}`;
      }
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          if (error.code === "ECONNREFUSED") {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
          }
          if (error.code === "ER_DUP_ENTRY") {
            failure({ errors: [{ error: "duplicateEntry", message: "Record already exists." }] });
            return;
          }
          console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
          failure({ errors: [{ error: "databaseError", message: error.code }] });
        } else {
          this.DRAFT = false;
          success({ result: this });
        }
      });
    }
    if (this.METHOD === "STORAGE") {
      const storage = new AFStorage();
      const allRecords = storage.getRecordZone(this.NAME).getRecords()
      if (this.PROPERTIES[this.IDENTIFIER].autoIncrement && this.DRAFT === true) {
        var highest = 0;
        for (const i in allRecords) {
          highest = parseInt(allRecords[i][this.PROPERTIES[this.IDENTIFIER].name]);
        }
        this[this.IDENTIFIER] = highest + 1;
      }
      const zone = storage.getRecordZone(this.NAME);
      var data = {};
      for (const key in this.PROPERTIES) {
        data[this.PROPERTIES[key].name] = this[key];
      }
      if (this.DRAFT) {
        zone.addRecord(data);
        this.DRAFT = false;
      } else {
        zone.setRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID, data);
      }
      storage.save(zone);
      success({ result: this });
    }
  }


  /**
   * 
   */
  delete(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (this.METHOD === "DATABASE") {
      const database = new AFDatabase();
      const query = `DELETE FROM \`${this.NAME}\` WHERE \`${this.PROPERTIES[this.IDENTIFIER].name}\` = ?`;
      const parameters = [this[this.IDENTIFIER]];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          if (error.code === "ECONNREFUSED") {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
          } else {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
          }
          failure({ errors: [{ error: "databaseError", message: error.code }] });
        } else {
          success({});
        }
      });
    }
    if (this.METHOD === "STORAGE") {
      const storage = new AFStorage();
      const zone = storage.getRecordZone(this.NAME);
      if (!this.DRAFT) {
        if (zone.deleteRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID)) {
          storage.save(zone);
          success({});
        }
      }
    }
  }


  /**
   * @description Returns all records matching this key-value condition.
   * @param {String} key 
   * @param {any} value 
   */
  where(key, value) {
    this.DRAFT = false;
    if (this.METHOD === "DATABASE") {
      const database = new AFDatabase();
      const query = `SELECT * FROM \`${this.NAME}\` WHERE \`${key}\` = ?`;
      const parameters = [value];
      return new AFModel(this, (resolve, reject) => {
        database.connection.query(query, parameters, (error, results, fields) => {
          if (error) {
            if (error.code === "ECONNREFUSED") {
              console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
            }
            reject({ error: error });
          } else {
            if (results.length === 1) {
              const result = results[0];
              for (const key in this.PROPERTIES) {
                this[key] = result[this.PROPERTIES[key].name];
              }
              resolve({ self: this });
            } else {
              reject({ error: new Error("Targets is not singular.") });
            }
          }
        });
      });
    }
    if (this.METHOD === "STORAGE") {
      var results = [];
      const storage = new AFStorage();
      const zone = storage.getRecordZone(this.NAME);
      return new AFModel(this, (resolve, reject) => {
        if (zone === null) {
          reject({ error: new Error("Zone not found.") });
        }
        const records = zone.getRecords();
        for (const i in records) {
          if (records[i].hasOwnProperty(key)) {
            const recordValue = records[i][key];
            if (recordValue === value) {
              results.push(records[i]);
            }
          }
        }
        if (results.length === 1) {
          const result = results[0];
          for (const key in this.PROPERTIES) {
            this[key] = result[this.PROPERTIES[key].name];
          }
          resolve({ self: this });
        } else {
          reject({ error: new Error("Targets is not singular.") });
        }
      });
    }
  }


  /**
   * @description Returns this in the form of a callback, but asyncronous.
   */
  fetch(selfCallback) {
    const onFetch = selfCallback ? typeof selfCallback === "function" ? selfCallback : () => { } : () => { };
    this.PROMISE(({ self }) => {
      if (this.PROMISE !== null) {
        onFetch({ self, error: null });
        this.PROMISE = null;
      }
    }, ({ error }) => {
      if (this.PROMISE !== null) {
        onFetch({ self: null, error });
        this.PROMISE = null;
      }
    });
  }


  /**
   * @description Returns JSON representation.
   * @returns {Object}
   */
  get() {
    var structure = {};
    for (const key in this.PROPERTIES) {
      structure[key] = this[key];
    }
    return structure;
  }

}


AFModel.register = (Model) => {
  const dummy = new Model();
  Model.PROPERTIES = dummy.PROPERTIES;
  Model.IDENTIFIER = dummy.IDENTIFIER;
  Model.METHOD = dummy.METHOD;
  Model.DRAFT = dummy.DRAFT;
  Model.NAME = dummy.NAME;


  /**
   */
  function dataset(array, conditions, onReady) {
    var query = "SELECT ";
    var columns = [];
    var wheres = [];
    var values = [];
    const properties = Model.PROPERTIES;
    for(const key of array) {
      if (properties.hasOwnProperty(key)) {
        columns.push(`${properties[key].name} AS '${key}'`);
      } else {
        const parts = key.split(".");
        if (properties.hasOwnProperty(parts[0]) && parts.length > 1) {
          const property = properties[parts[0]];
          if (property.hasOwnProperty("model")) {
            const foreign = parts[0];
            const column = parts[1];
            const foreignKey = properties[foreign].name;
            const model = property.model;
            const foreignModel = require(`${projectPWD}/app/models/${model}.js`).default;
            if(foreignModel.PROPERTIES.hasOwnProperty(column)) {
              const subquery = `(SELECT ${foreignModel.PROPERTIES[column].name} FROM ${foreignModel.NAME} WHERE ${foreignKey} = ${Model.NAME}.${foreignKey})`;
              columns.push(`${subquery} AS '${key}'`);
            }
          }
        } else {
          console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) dataset contains key '${key}' that is not part of '${Model.NAME}'.\x1b[0m`);
        }
      }
    }
    for(const condition of conditions) {
      wheres.push(`${condition.key} = ?`);
      values.push(condition.value);
    }
    query += columns.join(", ");
    query += ` FROM ${Model.NAME}`;
    if (wheres.length > 0) {
      query += ` WHERE `;
      query += wheres.join(" AND ");
    }
    if (properties.hasOwnProperty("createdAt")) {
      query += `ORDER BY ${properties["createdAt"].name} DESC`;
    }
    // console.log(query);
    database.query(query, values, (error, results, fields) => {
      if (error) {
        console.log(error);
      }
      onReady(error, results);
    });
  }
  Model.dataset = dataset;


  /**
   * @description Returns JSON representation.
   * @deprecated
   * @param {[AFModel]}
   * @returns {Object}
   */
  function get(array) {
    var data = [];
    for (const row of array) {
      data.push(row.get());
    }
    return data
  }
  Model.get = get;


  /**
   * @description Returns all records.
   * @deprecated
   */
  function all(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (Model.METHOD === "DATABASE") {
      const database = new AFDatabase();
      const query = `SELECT * FROM \`${Model.NAME}\``;
      const parameters = [];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          if (error.code === "ECONNREFUSED") {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
          } else {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
          }
          failure({ errors: [{ error: "databaseError", message: error.code }] });
          return;
        } else {
          var data = [];
          for (const result of results) {
            const model = new AFModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(result);
            data.push(model);
          }
          success({ results: data });
        }
      });
    }
    if (Model.METHOD === "STORAGE") {
      const storage = new AFStorage();
      const zone = storage.getRecordZone(Model.NAME);
      if (zone === null) {
        success({ results: [] })
      }
      const records = zone.getRecords();
      var results = [];
      for (const record in records) {
        const model = new AFModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
        model.setupDone(records[record]);
        results.push(model);
      }
      success({ results: results })
    }
  }
  Model.all = all;


  /**
   * @description Returns all records matching this key-value condition.
   * @deprecated
   * @param {String} key 
   * @param {any} value 
   */
  function where(key, value, options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (Model.METHOD === "DATABASE") {
      const database = new AFDatabase();
      const query = `SELECT * FROM \`${Model.NAME}\` WHERE \`${key}\` = ?`;
      const parameters = [value];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          if (error.code === "ECONNREFUSED") {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
          } else {
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
          }
          failure({ errors: [{ error: "databaseError", message: error.code }] });
          return;
        } else {
          var data = [];
          for (const result of results) {
            const model = new AFModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(result);
            data.push(model);
          }
          success({ results: data });
        }
      });
    }
    if (Model.METHOD === "STORAGE") {
      var results = [];
      const storage = new AFStorage();
      const zone = storage.getRecordZone(Model.NAME);
      if (zone === null) {
        success({ results: [] })
      }
      const records = zone.getRecords();
      for (const record in records) {
        if (records[record].hasOwnProperty(key)) {
          const recordValue = records[record][key];
          if (recordValue === value) {
            const model = new AFModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(records[record]);
            results.push(model);
          }
        }
      }
      success({ results: results });
    }
  }
  Model.where = where;


  return Model;
}


export default AFModel.register(AFModel);