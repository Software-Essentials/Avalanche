const { AVAStorage, AVARecordZone } = require("../index");


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
    this.DRAFT = false;
  }


  /**
   * 
   */
  setupDone() {
    const storage = new AVAStorage();
    if(typeof arguments[0] === "object") {
      const object = arguments[0];
      for(const key in this.PROPERTIES) {
        if(object.hasOwnProperty(this.PROPERTIES[key]) === false) {
          throw "Model incomplete";
        }
        this[key] = object[this.PROPERTIES[key]]
      }
      if(!storage.recordZoneExists(this.NAME)) {
        storage.addRecordZone(new AVARecordZone(this.NAME, []));
      }
    } else {
      for(const key in this.PROPERTIES) {
        this[key] = null;
      }
      this.DRAFT = true;
      if(!storage.recordZoneExists(this.NAME)) {
        storage.addRecordZone(new AVARecordZone(this.NAME, []))
      }
      const all = storage.getRecordZone(this.NAME).getRecords()
      var highest = 0;
      for(const r in all) {
        highest = parseInt(all[r][this.PROPERTIES[this.IDENTIFIER]]);
      }
      this[this.IDENTIFIER] = highest + 1;
    }
  }


  /**
   * 
   */
  save() {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(this.NAME);
    var data = {};
    for(const key in this.PROPERTIES) {
      data[this.PROPERTIES[key]] = this[key];
    }
    if(this.DRAFT) {
      zone.addRecord(data);
      this.DRAFT = false;
    } else {
      zone.setRecordWhere(this.PROPERTIES[this.IDENTIFIER], this.ID, data)
    }
    storage.save(zone);
    return true;
  }


  /**
   * 
   */
  delete() {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(this.NAME);
    if(!this.DRAFT) {
      if(zone.deleteRecordWhere(this.PROPERTIES[this.IDENTIFIER], this.ID)) {
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
      structure[this.PROPERTIES[key]] = this[key];
    }
    return structure;
  }


  /**
   * @description Returns all posts.
   * @returns {[Post]}
   */
  all() {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(this.NAME);
    const records = zone.getRecords();
    var results = [];
    for(const record in records) {
      const model = new AVAModel(this.NAME, this.IDENTIFIER, this.PROPERTIES);
      model.setupDone(records[record]);
      results.push(model);
    }
    return results;
  }
  
  
  /**
   * @description Returns all posts matching this key-value condition.
   * @param {String} key 
   * @param {any} value 
   * @returns {[Post]}
   */
  where(key, value) {
    const storage = new AVAStorage();
    const zone = storage.getRecordZone(this.NAME);
    const records = zone.getRecords();
    var results = [];
    for(const record in records) {
      if(records[record].hasOwnProperty(key)) {
        const recordValue = records[record][key];
        if(recordValue === value) {
          const model = new AVAModel(this.NAME, this.IDENTIFIER, this.PROPERTIES);
          model.setupDone(records[record]);
          results.push(model);
        }
      }
    }
    return results;
  }

}


module.exports = AVAModel;