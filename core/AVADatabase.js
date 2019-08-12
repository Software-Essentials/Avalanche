const fs = require("fs");
const projectPWD = process.env.PWD;



/**
 * @description Can be used to store large or structured files.
 */
class AVADatabase {

  constructor() {
  }

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

  query(query, parameters, callback) {
    global.database.query(query, parameters, callback())
  }

}

module.exports = AVADatabase;