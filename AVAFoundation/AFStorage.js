import fs from "fs";
import AFRecordZone from "./AFRecordZone";
import { directoryLooper } from "./AFUtil";


/**
 * @description Can be used to store large or structured files.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFStorage {

  constructor() {
    const path = `${projectPWD}/storage`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }

  /**
   * @param {String} name Name of the record zone you want to retrieve.
   * @returns {AFRecordZone|null}
   */
  getRecordZone(name) {
    const path = `${projectPWD}/storage/${name}.json`;
    if (fs.existsSync(path)) {
      const data = require(path)
      return new AFRecordZone(name, data);
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
    if (fs.existsSync(path)) {
      return true
    }
    return false;
  }

  /**
   * @description Adds a RecordZone to the Storage.
   * @param {AFRecordZone} recordZone Record zone to add.
   */
  addRecordZone(recordZone) {
    const name = recordZone.name;
    const path = `${projectPWD}/storage/${name}.json`;
    const records = recordZone.getRecords();
    if (!fs.existsSync(path)) {
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
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  /**
   * @description Updates the Storage with the updated RecordZone.
   * @param {AFRecordZone} recordZone Record zone to save.
   */
  save(recordZone) {
    const name = recordZone.name;
    const path = `${projectPWD}/storage/${name}.json`;
    const records = recordZone.getRecords();
    if (fs.existsSync(path)) {
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
    const children = directoryLooper(storagePath, []).children;
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
AFStorage.wipe = wipe;


export default AFStorage;