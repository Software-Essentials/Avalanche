const { AVAStorage, AVARecordZone, AVADatabase, AVAError } = require("../index");


/**
 * Super model
 */
class AVAModel {

  /**
   * @param {String} name Name of the resource.
   */
  constructor() {
    if(typeof arguments[0] === "string" && typeof arguments[1] === "string" && typeof arguments[2] === "object") {
      this.NAME = arguments[0];
      this.IDENTIFIER = arguments[1];
      this.PROPERTIES = arguments[2];
      this.METHOD = "STORAGE";
      this.DRAFT = false;
    }
    if(typeof arguments[0] === "object" && arguments[0] instanceof AVAModel, typeof arguments[1] === "function") {
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
    if(this.METHOD === "DATABASE") {
      if(typeof arguments[0] === "object") {
        const object = arguments[0];
        for(const key in this.PROPERTIES) {
          if(object.hasOwnProperty(this.PROPERTIES[key].name) === false) {
            throw new AVAError("Model incomplete");
          }
          this[key] = object[this.PROPERTIES[key].name]
        }
      } else {
        for(const key in this.PROPERTIES) {
          this[key] = null;
        }
        this.DRAFT = true;
      }
    }
    if(this.METHOD === "STORAGE") {
      const storage = new AVAStorage();
      if(!storage.recordZoneExists(this.NAME)) {
        storage.addRecordZone(new AVARecordZone(this.NAME, []));
      }
      if(typeof arguments[0] === "object") {
        const object = arguments[0];
        for(const key in this.PROPERTIES) {
          if(object.hasOwnProperty(this.PROPERTIES[key].name) === false) {
            throw new AVAError("Model incomplete");
          }
          this[key] = object[this.PROPERTIES[key].name]
        }
      } else {
        for(const key in this.PROPERTIES) {
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
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => {} : () => {};
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => {} : () => {};
    if(this.METHOD === "DATABASE") {
      const database = new AVADatabase();
      var keys = [];
      var values = [];
      for(const key in this.PROPERTIES) {
        keys.push(this.PROPERTIES[key].name);
        const value = this[key];
        switch (typeof value) {
          case "string":
            values.push(`'${value}'`);
            break;
          case "number":
            values.push(value);
            break;
          case "boolean":
              values.push(value ? 1 : 0);
            break;
          default:
            values.push("NULL");
        }
      }
      var setString = "";
      var merged = keys.reduce((object, key, index) => {
        object[key] = values[index];
        return object;
      }, {});
      for (const key in merged) {
        if (key !== this.PROPERTIES[this.IDENTIFIER].name) {
          if (setString === "") {
            setString = `${key} = ${merged[key]}`;
          } else {
            setString = `${setString}, ${key} = ${merged[key]}`;
          }
        }
      }
      var query = "";
      if (this.DRAFT) {
        query = `INSERT INTO \`${this.NAME}\` (${keys.join(", ")}) VALUES (${values.join(", ")})`;
      } else {
        query = `UPDATE \`${this.NAME}\` SET ${setString} WHERE ${this.PROPERTIES[this.IDENTIFIER].name} = ${this[this.IDENTIFIER]}`;
      }
      const parameters = [];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          failure({error: error});
        } else {
          this.DRAFT = false;
          success({});
        }
      });
    }
    if (this.METHOD === "STORAGE") {
      const storage = new AVAStorage();
      const allRecords = storage.getRecordZone(this.NAME).getRecords()
      var highest = 0;
      for(const i in allRecords) {
        highest = parseInt(allRecords[i][this.PROPERTIES[this.IDENTIFIER].name]);
      }
      this[this.IDENTIFIER] = highest + 1;
      const zone = storage.getRecordZone(this.NAME);
      var data = {};
      for(const key in this.PROPERTIES) {
        data[this.PROPERTIES[key].name] = this[key];
      }
      if(this.DRAFT) {
        zone.addRecord(data);
        this.DRAFT = false;
      } else {
        zone.setRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID, data)
      }
      storage.save(zone);
      success({});
    }
  }


  /**
   * 
   */
  delete(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => {} : () => {};
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => {} : () => {};
    if (this.METHOD === "DATABASE") {
      const database = new AVADatabase();
      const query = `DELETE FROM \`${this.NAME}\` WHERE \`${this.PROPERTIES[this.IDENTIFIER].name}\` = ?`;
      const parameters = [this[this.IDENTIFIER]];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          failure({error: error});
        } else {
          success({});
        }
      });
    }
    if (this.METHOD === "STORAGE") {
      const storage = new AVAStorage();
      const zone = storage.getRecordZone(this.NAME);
      if(!this.DRAFT) {
        if(zone.deleteRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID)) {
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
      const database = new AVADatabase();
      const query = `SELECT * FROM \`${this.NAME}\` WHERE \`${key}\` = ?`;
      const parameters = [value];
      return new AVAModel(this, (resolve, reject) => {
        database.connection.query(query, parameters, (error, results, fields) => {
          if (error) {
            reject({error: error});
          } else {
            if (results.length === 1) {
              const result = results[0];
              for (const key in this.PROPERTIES) {
                this[key] = result[this.PROPERTIES[key].name];
              }
              resolve({self: this});
            } else {
              reject({error: new Error("Targets is not singular.")});
            }
          }
        });
      });
    }
    if (this.METHOD === "STORAGE") {
      var results = [];
      const storage = new AVAStorage();
      const zone = storage.getRecordZone(this.NAME);
      return new AVAModel(this, (resolve, reject) => {
        if(zone === null) {
          reject({error: new Error("Zone not found.")});
        }
        const records = zone.getRecords();
        for(const i in records) {
          if(records[i].hasOwnProperty(key)) {
            const recordValue = records[i][key];
            if(recordValue === value) {
              results.push(records[i]);
            }
          }
        }
        if (results.length === 1) {
          const result = results[0];
          for (const key in this.PROPERTIES) {
            this[key] = result[this.PROPERTIES[key].name];
          }
          resolve({self: this});
        } else {
          reject({error: new Error("Targets is not singular.")});
        }
      });
    }
  }


  /**
   * @description Returns this in the form of a callback, but asyncronous.
   */
  fetch(selfCallback) {
    const onFetch = selfCallback ? typeof selfCallback === "function" ? selfCallback : () => {} : () => {};
    this.PROMISE(({self}) => {
      console.log("ENDPOINT2");
      if (this.PROMISE !== null) {
        onFetch({self, error: null});
        this.PROMISE = null;
      }
    }, ({error}) => {
      console.log("FAILURE2");
      if (this.PROMISE !== null) {
        onFetch({self: null, error});
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
    for(const key in this.PROPERTIES) {
      structure[this.PROPERTIES[key].name] = this[key];
    }
    return structure;
  }

}


AVAModel.register = (Model) => {
  const dummy = new Model();
  Model.PROPERTIES = dummy.PROPERTIES;
  Model.IDENTIFIER = dummy.IDENTIFIER;
  Model.METHOD = dummy.METHOD;
  Model.DRAFT = dummy.DRAFT;
  Model.NAME = dummy.NAME;

  /**
   * @description Returns all records.
   */
  function all(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => {} : () => {};
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => {} : () => {};
    if (Model.METHOD === "DATABASE") {
      const database = new AVADatabase();
      const query = `SELECT * FROM \`${Model.NAME}\``;
      const parameters = [];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          failure({error: error});
        } else {
          var data = [];
          for (const result of results) {
            const model = new AVAModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(result);
            data.push(model);
          }
          success({results: data});
        }
      });
    }
    if (Model.METHOD === "STORAGE") {
      const storage = new AVAStorage();
      const zone = storage.getRecordZone(Model.NAME);
      if(zone === null) {
        success({results: []})
      }
      const records = zone.getRecords();
      var results = [];
      for(const record in records) {
        const model = new AVAModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
        model.setupDone(records[record]);
        results.push(model);
      }
      success({results: results})
    }
  }
  Model.all = all;
  
  
  /**
   * @description Returns all records matching this key-value condition.
   * @param {String} key 
   * @param {any} value 
   */
  function where(key, value, options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => {} : () => {};
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => {} : () => {};
    if (Model.METHOD === "DATABASE") {
      const database = new AVADatabase();
      const query = `SELECT * FROM \`${Model.NAME}\` WHERE \`${key}\` = ?`;
      const parameters = [value];
      database.connection.query(query, parameters, (error, results, fields) => {
        if (error) {
          failure({error: error});
        } else {
          var data = [];
          for (const result of results) {
            const model = new AVAModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(result);
            data.push(model);
          }
          success({results: data});
        }
      });
    }
    if (Model.METHOD === "STORAGE") {
      var results = [];
      const storage = new AVAStorage();
      const zone = storage.getRecordZone(Model.NAME);
      if(zone === null) {
        success({results: []})
      }
      const records = zone.getRecords();
      for(const record in records) {
        if(records[record].hasOwnProperty(key)) {
          const recordValue = records[record][key];
          if(recordValue === value) {
            const model = new AVAModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
            model.setupDone(records[record]);
            results.push(model);
          }
        }
      }
      success({results: results});
    }
  }
  Model.where = where;


  return Model;
}


module.exports = AVAModel;