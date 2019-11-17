import mysql from "mysql";
import { terminalPrefix } from "../core/CoreUtil";

const DATATYPES = {
  "INT": { type: "int", length: true, unsignable: true, incrementable: true },
  "TINYINT": { type: "tinyint", length: true, unsignable: true, incrementable: true },
  "SMALLINT": { type: "smallint", length: true, unsignable: true, incrementable: true },
  "MEDIUMINT": { type: "mediumint", length: true, unsignable: true, incrementable: true },
  "BIGINT": { type: "bigint", length: true, unsignable: true, incrementable: true },
  "FLOAT": { type: "float", unsignable: true, incrementable: true },
  "DECIMAL": { type: "decimal", formatLength: true, unsignable: true },
  "DOUBLE": { type: "double", unsignable: true, incrementable: true },
  "BIT": { type: "bit", length: true },
  "CHAR": { type: "char", string: true, length: true },
  "VARCHAR": { type: "varchar", string: true, length: true },
  "DATETIME": { type: "varchar", string: true },
  "DATE": { type: "date", string: true },
  "TIMESTAMP": { type: "timestamp", string: true },
  "TEXT": { type: "text", string: true },
  "TINYTEXT": { type: "tinytext", string: true },
  "MEDIUMTEXT": { type: "mediumtext", string: true },
  "LONGTEXT": { type: "longtext", string: true }
};

const CONSTRAINT_BEHAVIOUR = {
  NO_ACTION: "NO ACTION",
  RESTRICT: "RESTRICT",
  SET_NULL: "SET NULL",
  CASCADE: "CASCADE",
}

/**
 * @description Can be used to store large or structured files.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AVADatabase {

  constructor() {
    this.connection = mysql.createPool(environment.database);
    this.foreignKeyChecks = true;
  }


  /**
   * @description Does a request to the database.
   * @param {String} query 
   * @param {Object} parameters 
   * @param {Function} callback 
   */
  query(query, parameters, callback) {
    this.connection.query(query, parameters, callback);
  }


  wipeAllData(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    var wipes = {};
    const dbName = environment.database.database;
    const query = `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?;`;
    this.query(this.preQuery() + query, [dbName], (error, _results, fields) => {
      if (error) {
        failure({ error });
        return;
      }
      const results = _results.slice(1)[0];
      if (results.length > 0) {
        for (const result of results) {
          const table = result.name;
          wipes[table] = null;
          const query = `DELETE FROM \`${result.name}\`;`;
          this.query(this.preQuery() + query, [], (error, _results, fields) => {
            const results = _results.slice(1);
            if (error) {
              wipes[table] = false;
              failure({ error });
            } else {
              wipes[table] = true;
              update();
            }
          });
        }
      } else {
        update();
      }
    });
    function update() {
      var completed = 0;
      var successful = 0;
      for (const key in wipes) {
        if (wipes[key] !== null) completed++;
        if (wipes[key]) successful++;
      }
      if (completed === Object.keys(wipes).length) {
        success({
          total: completed,
          success: successful
        });
      }
    }
  }


  dropAllTables(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    var wipes = {};
    const dbName = environment.database.database;
    const query = `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = ?;`;
    this.query(this.preQuery() + query, [dbName], (error, _results, fields) => {
      if (error) {
        failure({ error });
        return;
      }
      const results = _results.slice(1)[0];
      if (results.length > 0) {
        for (const result of results) {
          const table = result.name;
          wipes[table] = null;
          const query = `DROP TABLE IF EXISTS \`${result.name}\`;`;
          this.query(this.preQuery() + query, [], (error, _results, fields) => {
            const results = _results.slice(1);
            if (error) {
              wipes[table] = false;
              failure({ error });
            } else {
              wipes[table] = true;
              update();
            }
          });
        }
      } else {
        update();
      }
    });
    function update() {
      var completed = 0;
      var successful = 0;
      for (const key in wipes) {
        if (wipes[key] !== null) completed++;
        if (wipes[key]) successful++;
      }
      if (completed === Object.keys(wipes).length) {
        success({
          total: completed,
          success: successful
        });
      }
    }
  }


  /**
   * @description Creates table in the database.
   * @param {String} tablename Name of the table.
   * @param {Array} columns Columns.
   * @param {Object} options Options.
   */
  createTable(tablename, columns, options) {
    const force = options ? options.force ? true : false : false;
    const primaryKey = options ? options.primaryKey ? options.primaryKey : null : null;
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    const that = this;
    var columnStrings = [];
    for (const column of columns) {
      const typeProperty = DATATYPES[column.type];
      const datatype = `${typeProperty.type}${typeProperty.length ? `(${column.length}) ` : " "}`;
      const name = column.name;
      const defaultVal = column.default;
      const required = !!column.required;
      const unique = !!column.unique;
      const unsigned = typeProperty.unsignable ? column.relatable : false;
      const autoIncrement = typeProperty.incrementable ? column.autoIncrement : false;
      const relation = column.relation;
      if (typeof relation === "string" || typeof relation === "object") {
        const options = typeof relation === "object" ? relation : {};
        const onDelete = typeof options.onDelete === "string" ? CONSTRAINT_BEHAVIOUR[options.onDelete.toUpperCase().split(" ").join("_")] : null;
        const onUpdate = typeof options.onUpdate === "string" ? CONSTRAINT_BEHAVIOUR[options.onUpdate.toUpperCase().split(" ").join("_")] : null;
        const foreignClass = typeof relation === "object" ? options.table : relation;
        const foreignModel = require(`${projectPWD}/app/models/${foreignClass}.js`).default;
        const foreignTable = foreignModel.NAME;
        const foreignKey = foreignModel.PROPERTIES[foreignModel.IDENTIFIER];
        const constraintName = `${tablename} ${foreignTable}`;
        columnStrings.push(`KEY \`${constraintName}\` (\`${name}\`)`);
        columnStrings.push(`CONSTRAINT \`${constraintName}\` FOREIGN KEY (\`${name}\`) REFERENCES \`${foreignTable}\` (\`${foreignKey.name}\`)${onDelete ? ` ON DELETE ${onDelete}` : ""}${onUpdate ? ` ON UPDATE ${onUpdate}` : ""}`);
      }
      columnStrings.push(`\`${name}\` ${datatype}${unsigned ? "unsigned " : ""}${required ? "NOT NULL " : ""}${defaultVal !== undefined ? `DEFAULT ${!!typeProperty.string ? `'${defaultVal}' ` : `${defaultVal} `} ` : ""}${autoIncrement ? "AUTO_INCREMENT " : ""}`.trim());
      if (unique) {
        columnStrings.push(`UNIQUE KEY \`${name}\` (\`${name}\`)`);
      }
    }
    if (primaryKey) {
      columnStrings.push(`PRIMARY KEY (\`${primaryKey}\`)`);
    }
    if (force) {
      const query = `DROP TABLE IF EXISTS \`${tablename}\`;`;
      this.query(that.preQuery() + query, [], (error, _results, fields) => {
        const results = _results.slice(1);
        if (error) {
          failure({ table: tablename, error: error });
          return;
        }
        create();
      });
    } else {
      create();
    }
    function create() {
      const query = `CREATE TABLE \`${tablename}\` (${columnStrings.join(", ")}) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;`;
      that.query(that.preQuery() + query, [], (error, _results, fields) => {
        const results = _results.slice(1);
        if (error) {
          failure({ table: tablename, error: error });
          return;
        }
        success({ table: tablename });
      });
    }
  }


  insertInto(name, data, options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (!Array.isArray(data) || data.length <= 0) {
      failure({ table: name, error: new Error("No data given.") });
      return;
    }
    var columns = Object.keys(data[0]);
    var valuesSets = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      var records = []
      for (const key in row) {
        const record = row[key];
        switch (typeof record) {
          case "string":
            records.push(`"${record}"`);
            break;
          case "number":
            records.push(`${record}`);
            break;
          case "boolean":
            records.push(record ? "1" : "0");
            break;
          case "object":
            records.push("NULL");
            break;
        }
      }
      valuesSets.push(records);
    }
    var values = [];
    for (const value of valuesSets) {
      values.push(`(${value.join(", ")})`);
    }
    const that = this;
    insert();
    function insert() {
      const query = `INSERT INTO \`${name}\` (${columns.join(", ")}) VALUES ${values.join(", ")};`;
      that.query(that.preQuery() + query, [], (error, _results, fields) => {
        const results = _results.slice(1);
        if (error) {
          failure({ table: name, error: error });
          return;
        }
        success({ table: name });
      });
    }
  }


  selectFromTable(name, options) {
    const conditions = options ? typeof options.conditions === "object" ? options.conditions : {} : {};
    var columns = options ? typeof options.columns === "object" ? options.columns : [] : [];
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    if (!Array.isArray(columns)) {
      columns = [];
    }
    const that = this;
    var compiledConditions = "1 = 1";
    select();
    function select() {
      const query = `SELECT ${columns.length <= 0 ? "*" : columns.join(", ")} FROM \`${name}\`${Object.keys(conditions).length > 0 ? ` WHERE ${compiledConditions}` : ""};`;
      that.query(that.preQuery() + query, [], (error, _results, fields) => {
        const results = _results.slice(1);
        if (error) {
          console.log(`${terminalPrefix()}\x1b[31m (error) Database error:\x1b[0 ${error.message}`);
          failure({ table: name, error: error });
          return;
        }
        success({ table: name, results: results, fields: fields });
      });
    }
  }

  preQuery() {
    return `SET foreign_key_checks = ${!!this.foreignKeyChecks ? "1" : "0"}; `;
  }

}


export default AVADatabase;