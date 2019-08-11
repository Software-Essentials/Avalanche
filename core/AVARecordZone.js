const { AVARecordZoneType } = require("../index.js");



/**
 * @description Record controller.
 */
class AVARecordZone {

  // /**
  //  * @param {String} name Name of the RecordZone.
  //  * @param {AVARecordZoneType|String} type
  //  */
  // constructor(name, type) {
  //   this.type = type === AVARecordZoneType.OBJECT ? type : AVARecordZoneType.LIST;
  //   this.name = name;
  // }

  /**
   * @param {String} name Name of the RecordZone.
   * @param {Object} data Data represented in a JSON structure.
   */
  constructor(name, data) {
    this.type = Array.isArray(data) ? AVARecordZoneType.LIST : AVARecordZoneType.OBJECT;
    this.name = name;
    this.data = data;
  }

  /**
   * @description Returns all records in the RecordZone.
   * @returns {Object}
   */
  getRecords() {
    return this.data;
  }

  /**
   * @description Returns the record at a certain index.
   * @param {Number} index Index.
   * @returns {any}
   */
  getRecordAtIndex(index) {
    if(this.type == AVARecordZoneType.LIST) {
      const record = this.data[index];
      if(typeof record !== "undefined") {
        return record;
      }
    }
    return null
  }

  /**
   * @description Adds record to the RecordZone.
   * @param {Object} data Data to add.
   */
  addRecord(data) {
    if(this.type === AVARecordZoneType.LIST) {
      this.data.push(data);
    }
  }

  /**
   * @description Adds record to the RecordZone.
   * @param {String} key Name of the key that the data will be added to.
   * @param {Object} data Data to add.
   */
  addRecord(key, data) {
    if(this.type === AVARecordZoneType.OBJECT) {
      this.data[key] = data;
    }
  }

}

module.exports = AVARecordZone;