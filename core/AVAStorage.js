const fs = require("fs");
const { AVARecordZone } = require("../index.js");
const projectPWD = process.env.PWD;



/**
 * @description Can be used to store large or structured files.
 */
class AVAStorage {

  constructor() {
    const path = `${projectPWD}/storage`;
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  /**
   * @param {String} name Name of the record zone you want to retrieve.
   * @returns {AVARecordZone|null}
   */
  getRecordZone(name) {
    const path = `${projectPWD}/storage/${name}.json`;
    if(fs.existsSync(path)) {
      const data = require(path)
      return new AVARecordZone(name, data);
    }
    return null;
  }

  /**
   * @description Adds a RecordZone to the Storage.
   * @param {AVARecordZone} recordZone Record zone to add.
   */
  addRecordZone(recordZone) {
    const name = recordZone.name;
    const path = `${projectPWD}/storage/${name}.json`;
    const records = recordZone.getRecords();
    if(!fs.existsSync(path)) {
      const data = JSON.stringify(records);
      fs.writeFileSync(path, data, "utf8");
    }
  }

  /**
   * @description Deletes a RecordZone from the Storage.
   * @param {String} name Name of the record zone you want to delete.
   */
  deleteRecordZone(name) {
    const path = `${projectPWD}/storage/${name}.json`;
    if(fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  /**
   * @description Updates the Storage with the updated RecordZone.
   * @param {AVARecordZone} recordZone Record zone to save.
   */
  save(recordZone) {
    const name = recordZone.name;
    const path = `${projectPWD}/storage/${name}.json`;
    const records = recordZone.getRecords();
    if(fs.existsSync(path)) {
      const data = JSON.stringify(records, null, 2);
      fs.writeFileSync(path, data, "utf8");
    }
  }

}

module.exports = AVAStorage;