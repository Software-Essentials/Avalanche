import { AFStorage, AFRecordZone, AFDatabase, AFError } from "../index";
import { parseBoolean } from "../AVAFoundation/AFUtil";
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
  save(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (this.METHOD === "DATABASE") {
      const database = new AFDatabase();
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
          } else {
            parameters.push(this[key]);
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
            parameters.push(this[key]);
          }
        }
        queryParts.push(keyValues.join(", "));
      }
      if (!this.DRAFT) {
        queryParts.push(`WHERE ${this.PROPERTIES[this.IDENTIFIER].name} = ?`);
        parameters.push(this[this.IDENTIFIER]);
      }
      database.connection.query(queryParts.join(" "), parameters, (error, results, fields) => {
        if (error) {
          console.log(error);
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
          if (results.affectedRows === 1) {
            success({ result: this });
          } else {
            failure({ errors: [{ error: "nothingUpdated", message: "Nothing updated." }] });
          }
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
  Model.select = ({ properties, conditions, onSuccess, onFailure }) => {
    const propertiesArray = Array.isArray(properties) ? properties : [];
    const conditionsArray = Array.isArray(conditions) ? conditions : [];
    const didSucceed = typeof onSuccess === "function" ? onSuccess : () => { };
    const didFail = typeof onFailure === "function" ? onFailure : () => { };
    var queryParts = ["SELECT"];
    var datasetProperties = {};
    var wheres = [];
    var parameters = [];
    const modelProperties = Model.PROPERTIES;
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
      console.log(`${ACUtil.terminalPrefix()}\x1b[33m (warning) select contains key '${key}' that is not part of '${Model.NAME}'.\x1b[0m`);
    }
    const columns = [];
    for (const key in datasetProperties) {
      columns.push(datasetProperties[key].query);
    }
    queryParts.push(columns.join(", "));
    queryParts.push(`FROM \`${Model.NAME}\``);
    for (const condition of conditionsArray) {
      const keyParts = condition.key.split(".");
      if (modelProperties.hasOwnProperty(keyParts[0])) {
        const property = modelProperties[keyParts[0]];
        if (keyParts.length === 1) {
          if (Model.PROPERTIES.hasOwnProperty(keyParts[0])) {
            const key = condition.key;
            const value = condition.value === null ? "NULL" : condition.value;
            if (value.toUpperCase() === "NULL" || value.toUpperCase() === "NOT NULL") {
              wheres.push(`${Model.PROPERTIES[key].name} IS ${value.toUpperCase()}`);
            } else {
              wheres.push(`${Model.PROPERTIES[key].name} = ?`);
              parameters.push(value);
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
    if (modelProperties.hasOwnProperty("createdAt")) {
      queryParts.push(`ORDER BY ${modelProperties["createdAt"].name} DESC`);
    }
    queryParts.push(";");
    if (environment.debug.logQueriesToConsole) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${queryParts.join(" ")}\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
    }
    database.query(queryParts.join(" "), parameters, (error, results, fields) => {
      if (error) {
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}.\x1b[0m`);
        didFail({ errors: [{ error: error.code, message: error.message }] });
        return;
      }
      for (var i in results) {
        const result = results[i];
        for (var key in result) {
          const type = datasetProperties[key].structure.type;
          if (type === "BOOL" || type === "BOOLEAN") {
            results[i][key] = results[i][key] ? true : false
          }
        }
      }
      didSucceed({ results });
    });
  }


  /**
   */
  Model.delete = ({ conditions, onSuccess, onFailure }) => {
    const conditionsArray = Array.isArray(conditions) ? conditions : [];
    const didSucceed = typeof onSuccess === "function" ? onSuccess : () => { };
    const didFail = typeof onFailure === "function" ? onFailure : () => { };
    var queryParts = [`DELETE FROM \`${Model.NAME}\``];
    var wheres = [];
    var parameters = [];
    const modelProperties = Model.PROPERTIES;
    for (const condition of conditionsArray) {
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
              parameters.push(value);
              wheres.push(`${Model.PROPERTIES[key].name} = ?`);
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
    queryParts.push(";");
    if (environment.debug.logQueriesToConsole) {
      console.log(`${ACUtil.terminalPrefix()}\x1b[36m MySQL query:\n\n\x1b[1m\x1b[35m${queryParts.join(" ")}\x1b[0m\n\n\x1b[36mParameters: \x1b[3m\x1b[35m`, parameters, "\x1b[0m");
    }
    database.query(queryParts.join(" "), parameters, (error, results, fields) => {
      if (error) {
        console.log(`${ACUtil.terminalPrefix()}\x1b[31m (error) ${error.message}.\x1b[0m`);
        didFail({ errors: [{ error: error.code, message: error.message }] });
        return;
      }
      didSucceed({ results });
    });
  }


  /**
   * @description Returns AFModel.
   * @param {Int|UUID}
   * @param {Function}
   */
  Model.get = (ID, { onSuccess, onFailure }) => {
    const model = new Model();
    Model.select({
      properties: Object.keys(Model.PROPERTIES),
      conditions: [{ key: Model.IDENTIFIER, value: ID }],
      onFailure,
      onSuccess: ({ results }) => {
        // NOTE: If results is empty it can't update because it doesnt exist. Therefor the request never completes. (goto /activity/update)
        if (results.length === 1) {
          const result = results[0];
          for (const property in result) {
            model[property.split(".")[0]] = result[property];
          }
          model.DRAFT = false;
          onSuccess(model);
        } else {
          onFailure({ errors: [{ error: "doesNotExist", message: "Does not exist." }] });
        }
      }
    });
  }


  return Model;
}


export default AFModel.register(AFModel);