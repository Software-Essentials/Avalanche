const fs = require("fs");
const mysql = require("mysql");
const projectPWD = process.env.PWD;


/**
 * @description Can be used to store large or structured files.
 */
class AVADatabase {

  constructor() {
    this.connection = mysql.createPool(global.environment.database);
  }


  /**
   * 
   */
  migrate() {
    const normalizedPath = `${projectPWD}/app/migrations`;
    var migrations = [];
    fs.readdirSync(normalizedPath).forEach(function (file) {
      const extensions = file.split(".");
      if (extensions.length = 2) {
        if (extensions[extensions.length - 1].toUpperCase() === "JSON") {
          const migration = require(`${projectPWD}/app/migrations/${file}`);
          migrations.push(migration);
        }
      }
    });
    console.log(migrations);
  }


  /**
   * @description Does a request to the database.
   * @param {String} query 
   * @param {Object} parameters 
   * @param {Function} callback 
   */
  query(query, parameters, callback) {
    this.connection.query(query, parameters, callback())
  }

}


module.exports = AVADatabase;