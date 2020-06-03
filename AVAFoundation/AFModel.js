import { AFStorage, AFRecordZone, AFDatabase, AFError } from "../index";
import { parseBoolean, UUID } from "../AVAFoundation/AFUtil";
import * as ACUtil from "../AVACore/ACUtil";


/**
 * @description Super model
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFModel {

  /**
   * @param {String} name Name of the resource.
   */
  constructor() {
    // if (typeof arguments[0] === "string" && typeof arguments[1] === "string" && typeof arguments[2] === "object") {
    //   this.NAME = arguments[0];
    //   this.IDENTIFIER = arguments[1];
    //   this.PROPERTIES = arguments[2];
    //   this.METHOD = "STORAGE";
    //   this.DRAFT = false;
    // }
    // if (typeof arguments[0] === "object" && arguments[0] instanceof AFModel, typeof arguments[1] === "function") {
    //   const self = arguments[0];
    //   this.NAME = self.NAME;
    //   this.IDENTIFIER = self.IDENTIFIER;
    //   this.PROPERTIES = self.PROPERTIES;
    //   this.METHOD = self.METHOD;
    //   this.DRAFT = self.DRAFT
    //   this.PROMISE = arguments[1];
    // }
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
  async save(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    const promise = new Promise((resolve, reject) => {
      if (this.METHOD === "DATABASE") {
        const database = new AFDatabase(environment.getDBCredentials());
        var queryParts = [this.DRAFT ? `INSERT INTO \`${this.NAME}\`` : `UPDATE \`${this.NAME}\` SET`];
        var parameters = [];
        if (this.DRAFT) {
          var columns = [];
          var values = [];
          if (this.PROPERTIES.hasOwnProperty("createdAt")) {
            this["createdAt"] = Math.floor(new Date() / 1000);
          }
          for (const key in this.PROPERTIES) {
            const property = this.PROPERTIES[key];
            if (property.autoIncrement) {
              continue;
            }
            columns.push(property.name);
            values.push("?");
            if (property.type === "BOOLEAN") {
              parameters.push(parseBoolean(this[key]));
            } else if (property.type === "UUID" && property.required && !this[key]) {
              parameters.push(uuidToShort(new UUID().string));
            } else {
              parameters.push(property.type === "UUID" && isUUID(pushableValue) ? uuidToShort(this[key]) : this[key]);
            }
          }
          queryParts.push(`(${columns.join(", ")}) VALUES (${values.join(", ")})`);
        } else {
          var keyValues = [];
          if (this.PROPERTIES.hasOwnProperty("updatedAt")) {
            this["updatedAt"] = Math.floor(new Date() / 1000);
          }
          for (const key in this.PROPERTIES) {
            if (key === this.IDENTIFIER) {
              continue;
            }
            const property = this.PROPERTIES[key];
            keyValues.push(`${property.name} = ?`);
            if (property.type === "BOOLEAN") {
              parameters.push(parseBoolean(this[key]));
            } else {
              parameters.push(property.type === "UUID" && isUUID(pushableValue) ? uuidToShort(this[key]) : this[key]);
            }
          }
          queryParts.push(keyValues.join(", "));
        }
        if (!this.DRAFT) {
          queryParts.push(`WHERE ${this.PROPERTIES[this.IDENTIFIER].name} = ?`);
          parameters.push(this[this.IDENTIFIER]);
        }
        if (environment.debug.logQueriesToConsole) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${queryParts.join(" ")};\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
        }
        database.query(queryParts.join(" ") + ";", parameters, (error, results, fields) => {
          if (error) {
            console.log(error);
            if (error.code === "ECONNREFUSED") {
              console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
            }
            if (error.code === "ER_DUP_ENTRY") {
              failure({ errors: [{ error: "duplicateEntry", message: "Record already exists." }] });
              reject({ errors: [{ error: "duplicateEntry", message: "Record already exists." }] });
              return;
            }
            console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
            failure({ errors: [{ error: "databaseError", message: error.code }] });
            reject({ errors: [{ error: "databaseError", message: error.code }] });
          } else {
            this.DRAFT = false;
            if (results.affectedRows === 1) {
              success({ result: this });
              resolve({ result: this });
              return;
            }
            failure({ errors: [{ error: "nothingUpdated", message: "Nothing updated." }] });
            reject({ errors: [{ error: "nothingUpdated", message: "Nothing updated." }] });
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
        resolve({ result: this });
      }
    });
    return promise;
  }


  /**
   * 
   */
  async delete(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    const promise = new Promise((resolve, reject) => {
      if (this.METHOD === "DATABASE") {
        const database = new AFDatabase(environment.getDBCredentials());
        const query = `DELETE FROM \`${this.NAME}\` WHERE \`${this.PROPERTIES[this.IDENTIFIER].name}\` = ?`;
        const parameters = [this[this.IDENTIFIER]];
        if (environment.debug.logQueriesToConsole) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${query};\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
        }
        database.connection.query(query + ";", parameters, (error, results, fields) => {
          if (error) {
            if (error.code === "ECONNREFUSED") {
              console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) No database connection.\x1b[0m`);
            } else {
              console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ${error.message}\x1b[0m`);
            }
            failure({ errors: [{ error: "databaseError", message: error.code }] });
            reject({ errors: [{ error: "databaseError", message: error.code }] });
          }
          success({});
          resolve({});
        });
        return;
      }
      if (this.METHOD === "STORAGE") {
        const storage = new AFStorage();
        const zone = storage.getRecordZone(this.NAME);
        if (!this.DRAFT) {
          if (zone.deleteRecordWhere(this.PROPERTIES[this.IDENTIFIER].name, this.ID)) {
            storage.save(zone);
            success({});
            resolve({});
          }
        }
        return;
      }
      reject({ errors: [{ error: "NO METHOD" }] });
    });
    return promise;
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
  Model.select = async ({ properties, conditions, ordering, limit, offset, page, onFailure, onSuccess }) => {
    var limit = isNaN(parseInt(limit)) ? null : parseInt(limit);
    var offset = isNaN(parseInt(offset)) ? null : parseInt(offset);
    var page = isNaN(parseInt(page)) ? null : parseInt(page);
    const propertiesArray = Array.isArray(properties) ? properties : [];
    const orderingObject = typeof ordering === "object" && !Array.isArray(ordering) ? ordering : {};
    const conditionsArray = Array.isArray(conditions) ? conditions : [];
    const conditionsObject = typeof conditions === "object" && !Array.isArray(conditions) ? conditions : {};
    const didSucceed = typeof onSuccess === "function" ? onSuccess : () => { };
    const didFail = typeof onFailure === "function" ? onFailure : () => { };
    var queryParts = ["SELECT"];
    var datasetProperties = {};
    var wheres = [];
    var parameters = [];
    const modelProperties = Model.PROPERTIES;
    const promise = new Promise((resolve, reject) => {
      for (const key of propertiesArray) {
        const keyParts = key.split(".");
        if (modelProperties.hasOwnProperty(keyParts[0])) {
          const property = modelProperties[keyParts[0]];
          if (keyParts.length === 1) {
            let alias = key;
            if (property.hasOwnProperty("model")) {
              const model = property.model;
              const foreignModel = require(`${projectPWD}/app/models/${model}.js`).default;
              if (foreignModel.PROPERTIES.hasOwnProperty("ID")) {
                alias = `${key}.ID`;
              }
            }
            datasetProperties[alias] = {};
            datasetProperties[alias].query = `${modelProperties[key].name} AS '${alias}'`;
            datasetProperties[alias].structure = modelProperties[key];
          } else if (keyParts.length > 1) {
            let alias = key;
            if (property.hasOwnProperty("model")) {
              const foreign = keyParts[0];
              const column = keyParts[1];
              const foreignKey = modelProperties[foreign].name;
              const model = property.model;
              const foreignModel = require(`${projectPWD}/app/models/${model}.js`).default;
              const foreignIdentifier = foreignModel.PROPERTIES[foreignModel.IDENTIFIER];
              if (foreignModel.PROPERTIES.hasOwnProperty(column)) {
                const subquery = `(SELECT ${foreignModel.PROPERTIES[column].name} FROM \`${foreignModel.NAME}\` WHERE ${foreignIdentifier.name} = \`${Model.NAME}\`.${foreignKey})`;
                datasetProperties[alias] = {};
                datasetProperties[alias].query = `${subquery} AS '${alias}'`;
                datasetProperties[alias].structure = foreignModel.PROPERTIES[column];
              }
            }
          }
          continue;
        }
        console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) selection contains key '${key}' that is not part of '${Model.NAME}'.\x1b[0m`);
      }
      const columns = [];
      for (const key in datasetProperties) {
        columns.push(datasetProperties[key].query);
      }
      queryParts.push(columns.join(", "));
      queryParts.push(`FROM \`${Model.NAME}\``);
      // Conditions array
      for (const condition of conditionsArray) { // Handle all where's
        const keyParts = condition.key.split(".");
        if (modelProperties.hasOwnProperty(keyParts[0])) {
          const property = modelProperties[keyParts[0]];
          if (keyParts.length === 1) {
            if (Model.PROPERTIES.hasOwnProperty(keyParts[0])) {
              const key = condition.key;
              const value = condition.value === null ? "NULL" : condition.value;
              if (typeof value === "string" && (value.toUpperCase() === "NULL" || value.toUpperCase() === "NOT NULL")) {
                wheres.push(`${Model.PROPERTIES[key].name} IS ${value.toUpperCase()}`);
              } else {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    for (const item of value) {
                      parameters.push(item);
                    }
                    wheres.push(`${Model.PROPERTIES[key].name} IN(${Array(value.length).fill("?").join(", ")})`);
                  } else {
                    wheres.push("0 = 1");
                  }
                } else {
                  if (property.type === "UUID") {
                    parameters.push(property.type === "UUID" && isUUID(value) ? uuidToShort(value) : value);
                    wheres.push(`${Model.PROPERTIES[key].name} = ?`);
                  } else {
                    parameters.push(value);
                    wheres.push(`${Model.PROPERTIES[key].name} = ?`);
                  }
                }
              }
            }
          } else if (keyParts.length > 1) {
            const foreignProperty = keyParts[1];
            if (property.hasOwnProperty("model")) {
              const model = property.model;
              const linkName = property.name;
              const foreignModel = require(`${projectPWD}/app/models/${model}.js`).default;
              if (foreignModel.PROPERTIES.hasOwnProperty(foreignProperty)) {
                const foreignPropertyName = foreignModel.PROPERTIES[foreignProperty].name;
                const foreignIdentifierName = foreignModel.PROPERTIES[foreignModel.IDENTIFIER].name;
                if (foreignIdentifierName === foreignPropertyName) {
                  wheres.push(`${linkName} = (SELECT ${foreignIdentifierName} FROM \`${foreignModel.NAME}\` WHERE ${foreignPropertyName} = ?)`);
                } else {
                  wheres.push(`${linkName} IN(SELECT ${foreignIdentifierName} FROM \`${foreignModel.NAME}\` WHERE ${foreignPropertyName} = ?)`);
                }
                parameters.push(condition.value);
              }
            }
          }
          continue;
        }
        console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) condition contains key '${condition.key}' that is not part of '${Model.NAME}'.\x1b[0m`);
      }

      // Conditions object
      for (const condition of Object.keys(conditionsObject)) {
        const key = condition;
        const conditions = conditionsObject[key];
        if (!Model.PROPERTIES.hasOwnProperty(key)) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) condition contains key '${key}' that is not part of '${Model.NAME}'.\x1b[0m`);
          continue;
        }
        for (const rule of Object.keys(conditions)) {
          const ruleKey = rule;
          const ruleValue = conditions[ruleKey];
          switch (ruleKey) {
            case "$gt":
            case "$greaterThan":
              parameters.push(ruleValue);
              wheres.push(`${Model.PROPERTIES[key].name} > ?`);
              break;
            case "$gte":
            case "$greaterThanEquals":
            case "$greaterThanOrEquals":
              parameters.push(ruleValue);
              wheres.push(`${Model.PROPERTIES[key].name} >= ?`);
              break;
            case "$lt":
            case "$lessThan":
              parameters.push(ruleValue);
              wheres.push(`${Model.PROPERTIES[key].name} < ?`);
              break;
            case "$lte":
            case "$lessThanEquals":
            case "$lessThanOrEquals":
              parameters.push(ruleValue);
              wheres.push(`${Model.PROPERTIES[key].name} <= ?`);
              break;
            case "$eq":
            case "$equals":
              const value = ruleValue === null ? "NULL" : ruleValue;
              if (typeof value === "string" && (value.toUpperCase() === "NULL" || value.toUpperCase() === "NOT NULL")) {
                wheres.push(`${Model.PROPERTIES[key].name} IS ${value.toUpperCase()}`);
              } else {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    for (const item of value) {
                      parameters.push(item);
                    }
                    wheres.push(`${Model.PROPERTIES[key].name} IN(${Array(value.length).fill("?").join(", ")})`);
                  } else {
                    wheres.push("0 = 1");
                  }
                } else {
                  parameters.push(value);
                  wheres.push(`${Model.PROPERTIES[key].name} = ?`);
                }
              }
              break;
          }
        }
      }
      if (wheres.length > 0) {
        queryParts.push("WHERE");
        queryParts.push(wheres.join(" AND "));
      }

      // Ordering
      const orders = [];
      for (const key of Object.keys(orderingObject)) {
        const value = orderingObject[key];
        if (!modelProperties.hasOwnProperty(key)) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) ordering contains key '${key}' that is not part of '${Model.NAME}'.\x1b[0m`);
          continue;
        }
        orders.push(`${modelProperties[key].name} ${value === -1 ? "DESC" : "ASC"}`);
      }
      if (orders.length < 1 && modelProperties.hasOwnProperty("createdAt")) {
        orders.push(`${modelProperties["createdAt"].name} DESC`);
      }
      if (orders.length > 0) {
        queryParts.push(`ORDER BY ${orders.join(", ")}`);
      }

      // Pagination
      page = page > 0 ? page - 1 : null;
      limit = limit > 0 ? limit : null;
      offset = offset > 0 ? offset : null;
      if (limit) {
        if (limit && !page && !offset) {
          queryParts.push(`LIMIT ${limit}`);
        } else if (page || offset) {
          queryParts.push(`LIMIT ${page ? limit * page : offset}, ${limit}`);
        }
      } else if (offset) {
        queryParts.push(`LIMIT ${offset}, ${10000}`);
      }

      // Execution
      // const compiled = `${select} ${from} ${conditions} ${ordering} ${limit}`;
      if (environment.debug.logQueriesToConsole) {
        console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${queryParts.join(" ")};\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
      }
      database.query(queryParts.join(" ") + ";", parameters, (error, results, fields) => {
        if (error) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}.\x1b[0m`);
          didFail({ errors: [{ error: error.code, message: error.message }] });
          reject({ errors: [{ error: error.code, message: error.message }] });
          return;
        }
        for (var i in results) {
          const result = results[i];
          for (var key in result) {
            const type = datasetProperties[key].structure.type;
            if (type === "BOOL" || type === "BOOLEAN") {
              results[i][key] = results[i][key] ? true : false
            }
            if (type === "UUID") {
              results[i][key] = isUUID(results[i][key]) ? results[i][key] : shortToUUID(results[i][key]);
            }
          }
        }
        didSucceed({ results });
        resolve({ results });
      });
    });
    return promise;
  }


  /**
   */
  Model.delete = ({ conditions, onFailure, onSuccess }) => {
    const conditionsArray = Array.isArray(conditions) ? conditions : [];
    const didSucceed = typeof onSuccess === "function" ? onSuccess : () => { };
    const didFail = typeof onFailure === "function" ? onFailure : () => { };
    var queryParts = [`DELETE FROM \`${Model.NAME}\``];
    var wheres = [];
    var parameters = [];
    const modelProperties = Model.PROPERTIES;
    const promise = new Promise((resolve, reject) => {
      for (const condition of conditionsArray) { // Handle all where's
        const keyParts = condition.key.split(".");
        if (modelProperties.hasOwnProperty(keyParts[0])) {
          const property = modelProperties[keyParts[0]];
          if (keyParts.length === 1) {
            if (Model.PROPERTIES.hasOwnProperty(keyParts[0])) {
              const key = condition.key;
              const value = condition.value === null ? "NULL" : condition.value;
              if (typeof value === "string" && (value.toUpperCase() === "NULL" || value.toUpperCase() === "NOT NULL")) {
                wheres.push(`${Model.PROPERTIES[key].name} IS ${value.toUpperCase()}`);
              } else {
                if (Array.isArray(value)) {
                  if (value.length > 0) {
                    for (const item of value) {
                      parameters.push(item);
                    }
                    wheres.push(`${Model.PROPERTIES[key].name} IN(${Array(value.length).fill("?").join(", ")})`);
                  } else {
                    wheres.push("0 = 1");
                  }
                } else {
                  parameters.push(value);
                  wheres.push(`${Model.PROPERTIES[key].name} = ?`);
                }
              }
            }
          } else if (keyParts.length > 1) {
            const foreignProperty = keyParts[1];
            if (property.hasOwnProperty("model")) {
              const model = property.model;
              const linkName = property.name;
              const foreignModel = require(`${projectPWD}/app/models/${model}.js`).default;
              if (foreignModel.PROPERTIES.hasOwnProperty(foreignProperty)) {
                const foreignPropertyName = foreignModel.PROPERTIES[foreignProperty].name;
                const foreignIdentifierName = foreignModel.PROPERTIES[foreignModel.IDENTIFIER].name;
                if (foreignIdentifierName === foreignPropertyName) {
                  wheres.push(`${linkName} = (SELECT ${foreignIdentifierName} FROM \`${foreignModel.NAME}\` WHERE ${foreignPropertyName} = ?)`);
                } else {
                  wheres.push(`${linkName} IN(SELECT ${foreignIdentifierName} FROM \`${foreignModel.NAME}\` WHERE ${foreignPropertyName} = ?)`);
                }
                parameters.push(condition.value);
              }
            }
          }
          continue;
        }
        console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) select (where) contains key '${condition.key}' that is not part of '${Model.NAME}'.\x1b[0m`);
      }
      if (wheres.length > 0) {
        queryParts.push("WHERE");
        queryParts.push(wheres.join(" AND "));
      }
      if (environment.debug.logQueriesToConsole) {
        console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${queryParts.join(" ")};\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
      }
      database.query(queryParts.join(" ") + ";", parameters, (error, results, fields) => {
        if (error) {
          console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}.\x1b[0m`);
          didFail({ errors: [{ error: error.code, message: error.message }] });
          reject({ errors: [{ error: error.code, message: error.message }] });
          return;
        }
        didSucceed({ results });
        resolve({ results });
      });
    });
    return promise;
  }


  /**
   * @description Returns AFModel.
   * @param {Int|UUID}
   * @param {Function}
   */
  Model.get = (ID, { onFailure, onSuccess }) => {
    const didSucceed = typeof onSuccess === "function" ? onSuccess : () => { };
    const didFail = typeof onFailure === "function" ? onFailure : () => { };
    const model = new Model();
    const promise = new Promise((resolve, reject) => {
      Model.select({
        properties: Object.keys(Model.PROPERTIES),
        conditions: [{ key: Model.IDENTIFIER, value: ID }],
        onFailure: errors => {
          didFail(errors)
          reject(errors);
        },
        onSuccess: ({ results }) => {
          // NOTE: If results is empty it can't update because it doesnt exist. Therefor the request never completes. (goto /activity/update)
          if (results.length === 1) {
            const result = results[0];
            for (const property in result) {
              model[property.split(".")[0]] = result[property];
            }
            model.DRAFT = false;
            didSucceed(model);
            resolve(model);
            return;
          }
          didFail({ errors: [{ error: "doesNotExist", message: "Does not exist." }] });
          reject({ errors: [{ error: "doesNotExist", message: "Does not exist." }] });
        }
      });
    });
    return promise;
  }


  return Model;
}


/**
 * Checks if the value is a UUID.
 * 
 * @param {String} uuid 
 */
function isUUID(uuid) {
  if (typeof uuid != "string" || uuid.match("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$") === null) {
    return false;
  }
  return true;
}


/**
 * Converts UUID to short UUID.
 * 
 * @param {String} uuid
 */
function uuidToShort(uuid) {
  return uuid.split("-").join("").toUpperCase();
}


/**
 * Converts short UUID to normal UUID.
 * 
 * @param {String} shortUUID 
 */
function shortToUUID(shortUUID) {
  if (typeof shortUUID !== "string" || shortUUID.length !== 32) {
    return null;
  }
  return (shortUUID.slice(0, 8) + "-" + shortUUID.slice(8, 12) + "-" + shortUUID.slice(12, 16) + "-" + shortUUID.slice(16, 20) + "-" + shortUUID.slice(20, 36)).toUpperCase();
}


export default AFModel.register(AFModel);