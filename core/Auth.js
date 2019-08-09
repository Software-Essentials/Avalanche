// Dependencies
const mysql = require("mysql");


/**
 * Database connection
 */
function getConnection() {
  return mysql.createPool(global.environment.database);
}

module.exports = {
  getConnection: getConnection
};
