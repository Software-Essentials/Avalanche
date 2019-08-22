const mysql = require("mysql");
const CoreUtil = require("../core/CoreUtil");


/**
 * @description Can be used to store large or structured files.
 */
class AVADatabase {

  constructor() {
    this.connection = mysql.createPool(global.environment.database);
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


  wipeAllTables(options) {
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    var wipes = {};
    const query = `SELECT table_name FROM information_schema.tables where table_schema='${global.environment.database.database}';`;
    this.query(query, [], (error, results, fields) => {
      if (error) {
        failure({ error });
        return;
      }
      if (results.length <= 0) {
        update();
      }
      for (const i in results) {
        const table = results[i].table_name;
        wipes[table] = null;
        const query = `DROP TABLE IF EXISTS \`${results[i].table_name}\`;`;
        this.query(query, [], (error, results, fields) => {
          if (error) {
            wipes[table] = false;
            failure({ error });
          } else {
            wipes[table] = true;
            update();
          }
        });
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
   * @param {String} name Name of the table.
   * @param {Array} columns Columns.
   * @param {Object} options Options.
   */
  createTable(name, columns, options) {
    const force = options ? options.force ? true : false : false;
    const primaryKey = options ? options.primaryKey ? options.primaryKey : null : null;
    const success = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    const failure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
    const that = this;
    const datatypes = {
      "INT": { type: "int", length: true, unsignable: true, incrementable: true },
      "TINYINT": { type: "tinyint", length: true, unsignable: true, incrementable: true },
      "SMALLINT": { type: "smallint", length: true, unsignable: true, incrementable: true },
      "MEDIUMINT": { type: "mediumint", length: true, unsignable: true, incrementable: true },
      "BIGINT": { type: "bigint", length: true, unsignable: true, incrementable: true },
      "FLOAT": { type: "float", unsignable: true, incrementable: true },
      "DECIMAL": { type: "decimal", formatLength: true, unsignable: true },
      "DOUBLE": { type: "double", unsignable: true, incrementable: true },
      "BIT": { type: "bit", length: true },
      "CHAR": { type: "char", length: true },
      "VARCHAR": { type: "varchar", length: true },
      "DATETIME": { type: "varchar" },
      "DATE": { type: "date" },
      "TIMESTAMP": { type: "timestamp" },
      "TEXT": { type: "text" },
      "TINYTEXT": { type: "tinytext" },
      "MEDIUMTEXT": { type: "mediumtext" },
      "LONGTEXT": { type: "longtext" }
    };
    var columnStrings = [];
    for (const column of columns) {
      const typeProperty = datatypes[column.type];
      const datatype = `${typeProperty.type}${typeProperty.length ? `(${column.length}) ` : " "}`;
      const name = column.name;
      const required = column.required;
      const unsigned = typeProperty.unsignable ? column.relatable : false;
      const autoIncrement = typeProperty.incrementable ? column.autoIncrement : false;
      columnStrings.push(`\`${name}\` ${datatype}${unsigned ? "unsigned " : ""}${required ? "NOT NULL " : ""}${autoIncrement ? "AUTO_INCREMENT " : ""}`.trim());
    }
    if (primaryKey) {
      columnStrings.push(`PRIMARY KEY (\`${primaryKey}\`)`);
    }
    if (force) {
      const query = `DROP TABLE IF EXISTS \`${name}\`;`;
      this.query(query, [], (error, results, fields) => {
        if (error) {
          failure({ table: name, error: error });
          return;
        }
        create();
      });
    } else {
      create();
    }
    function create() {
      const query = `CREATE TABLE \`${name}\` (${columnStrings.join(", ")}) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;`;
      that.query(query, [], (error, results, fields) => {
        if (error) {
          failure({ table: name, error: error });
          return;
        }
        success({ table: name });
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
      that.query(query, [], (error, results, fields) => {
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
      that.query(query, [], (error, results, fields) => {
        if (error) {
          console.log(`${CoreUtil.terminalPrefix()}\x1b[31m (error) Database error:\x1b[0 ${error.message}`);
          failure({ table: name, error: error });
          return;
        }
        success({ table: name, results: results, fields: fields });
      });
    }
  }

}


module.exports = AVADatabase;