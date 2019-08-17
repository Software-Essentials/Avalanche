const fs = require("fs");
const { AVARecordZone } = require("../index.js");
const CoreUtil = require("./CoreUtil");



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
   * @description Checks if a RecordZone exists.
   * @param {String} name Name of the RecordZone
   * @returns {Boolean}
   */
  recordZoneExists(name) {
    const path = `${projectPWD}/storage/${name}.json`;
    if(fs.existsSync(path)) {
      return true
    }
    return false;
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


/**
 * @description Wipes the storage clean.
 * @throws {Error}
 */
function wipe() {
  const storagePath = `${projectPWD}/storage`;
  if (fs.existsSync(storagePath)) {
    const children = CoreUtil.directoryLooper(storagePath, []).children;
    var paths = [];
    for (const i in children) {
      const index = children.length - (1 + parseInt(i));
      paths.push(children[index]);
    }
    for (const i in paths) {
      const child = paths[i];
      try {
        fs.unlinkSync(child);
      } catch (error) {
        throw error;
      }
    }
  }
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
  }
}
AVAStorage.wipe = wipe;


module.exports = AVAStorage;