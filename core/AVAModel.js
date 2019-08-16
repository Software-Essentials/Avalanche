const { AVAStorage, AVARecordZone, AVADatabase, AVAError } = require("../index");


/**
 * Super model
 */
class AVAModel {

  /**
   * @param {String} name Name of the resource.
   */
  constructor(NAME, IDENTIFIER, PROPERTIES) {
    this.NAME = NAME;
    this.IDENTIFIER = IDENTIFIER;
    this.PROPERTIES = PROPERTIES;
    this.METHOD = "STORAGE";
    this.DRAFT = false;
  }


  /**
   * 
   */
  setupDone() {
    if(this.METHOD === "DATABASE") {

    } else {
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
        const allRecords = storage.getRecordZone(this.NAME).getRecords()
        var highest = 0;
        for(const i in allRecords) {
          highest = parseInt(allRecords[i][this.PROPERTIES[this.IDENTIFIER].name]);
        }
        this[this.IDENTIFIER] = highest + 1;
      }
    }
  }


  /**
   * 
   */
  save() {
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
      const query = `INSERT INTO ${this.NAME} (${keys.join(", ")}) VALUES (${values.join(", ")})`;
      database.query(query, [], () => {

      });
    } else {
      const storage = new AVAStorage();
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
      return true;
    }
  }


  /**
   * 
   */
  delete() {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(this.NAME);
    if(!this.DRAFT) {
      if(zone.deleteRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID)) {
        storage.save(zone);
        return true
      }
    }
    return false;
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
   * @returns {[Post]}
   */
  function all() {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(Model.NAME);
    const records = zone.getRecords();
    var results = [];
    for(const record in records) {
      const model = new AVAModel(Model.NAME, Model.IDENTIFIER, Model.PROPERTIES);
      model.setupDone(records[record]);
      results.push(model);
    }
    return results;
  }
  Model.all = all;
  
  
  /**
   * @description Returns all records matching this key-value condition.
   * @param {String} key 
   * @param {any} value 
   * @returns {[Post]}
   */
  function where(key, value) {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(Model.NAME);
    const records = zone.getRecords();
    var results = [];
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
    return results;
  }
  Model.where = where;


  return Model;
}


module.exports = AVAModel;