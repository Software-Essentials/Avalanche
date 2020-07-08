import { AFStorage, AFRecordZone, AFDatabase, AFError } from "../index";
import { parseBoolean, UUID, isUUID, shortToUUID, uuidToShort } from "../AVAFoundation/AFUtil";
import * as ACUtil from "../AVACore/ACUtil";


/**
 * @description Super model
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFModel {

  constructor() {
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
    return new Promise((resolve, reject) => {
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
              parameters.push((property.model || property.type === "UUID") && isUUID(this[key]) ? uuidToShort(this[key]) : this[key]);
            }
          }
          queryParts.push(`(${columns.join(", ")}) VALUES (${values.join(", ")})`);
        } else {
          var keyValues = [];
          if (this.PROPERTIES.hasOwnProperty("modifiedAt")) {
            this["modifiedAt"] = Math.floor(new Date() / 1000);
          }
          if (this.PROPERTIES.hasOwnProperty("modifiedAt")) { // DEPRECATED
            this["modifiedAt"] = Math.floor(new Date() / 1000);
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
              parameters.push((property.model || property.type === "UUID") && isUUID(this[key]) ? uuidToShort(this[key]) : this[key]);
            }
          }
          queryParts.push(keyValues.join(", "));
        }
        if (!this.DRAFT) {
          queryParts.push(`WHERE ${this.PROPERTIES[this.IDENTIFIER].name} = ?`);
          parameters.push(this.PROPERTIES[this.IDENTIFIER].type === "UUID" && isUUID(this[this.IDENTIFIER]) ? uuidToShort(this[this.IDENTIFIER]) : this[this.IDENTIFIER]);
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
            failure({ errors: [{ error: "nothingmodified", message: "Nothing modified." }] });
            reject({ errors: [{ error: "nothingmodified", message: "Nothing modified." }] });
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
  }


  /**
   * @description Removes the current instance from the database.
   */
  async delete() {
    const success = arguments[0] ? typeof arguments[0].onSuccess === "function" ? arguments[0].onSuccess : () => { } : () => { };
    const failure = arguments[0] ? typeof arguments[0].onFailure === "function" ? arguments[0].onFailure : () => { } : () => { };
    return new Promise((resolve, reject) => {
      if (this.METHOD === "DATABASE") {
        const database = new AFDatabase(environment.getDBCredentials());
        const property = this.PROPERTIES[this.IDENTIFIER];
        const value = this[this.IDENTIFIER];
        const parameters = [(property.model || property.type === "UUID") && isUUID(value) ? uuidToShort(value) : value];
        const query = `DELETE FROM \`${this.NAME}\` WHERE \`${property.name}\` = ?`;
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
   * 
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
                      parameters.push((property.model || property.type === "UUID") && isUUID(item) ? uuidToShort(item) : item);
                    }
                    wheres.push(`${Model.PROPERTIES[key].name} IN(${Array(value.length).fill("?").join(", ")})`);
                  } else {
                    wheres.push("0 = 1");
                  }
                } else {
                  parameters.push((property.model || property.type === "UUID") && isUUID(value) ? uuidToShort(value) : value);
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
                parameters.push((property.model || property.type === "UUID") && isUUID(condition.value) ? uuidToShort(condition.value) : condition.value);
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
                      parameters.push(isUUID(item) ? uuidToShort(item) : item);
                    }
                    wheres.push(`${Model.PROPERTIES[key].name} IN(${Array(value.length).fill("?").join(", ")})`);
                  } else {
                    wheres.push("0 = 1");
                  }
                } else {
                  parameters.push(isUUID(value) ? uuidToShort(value) : value);
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
          console.log("TEST1");
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
            } else if (type === "UUID" || typeof type === "undefined") {
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
    return promise = new Promise((resolve, reject) => {
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
                      parameters.push((property.model || property.type === "UUID") && isUUID(item) ? uuidToShort(item) : item);
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
          console.log("TEST2");
          console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}.\x1b[0m`);
          didFail({ errors: [{ error: error.code, message: error.message }] });
          reject({ errors: [{ error: error.code, message: error.message }] });
          return;
        }
        didSucceed({ results });
        resolve({ results });
      });
    });
  }


  /**
   * @description Returns AFModel.
   * @param {Int|UUID}
   * @param {Function}
   */
  Model.get = (ID) => {
    const options = typeof arguments[1] === "object" ? arguments[1] : {};
    const didSucceed = typeof options.onSuccess === "function" ? options.onSuccess : () => { };
    const didFail = typeof options.onFailure === "function" ? options.onFailure : () => { };
    const model = new Model();
    return new Promise(async (resolve, reject) => {
      try {
        const { results } = await Model.select({
          properties: Object.keys(Model.PROPERTIES),
          conditions: [{ key: Model.IDENTIFIER, value: ID }]
        });
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
      } catch (errors) {
        didFail(errors)
        reject(errors);
      }
    });
  }


  return Model;
}


export default AFModel.register(AFModel);