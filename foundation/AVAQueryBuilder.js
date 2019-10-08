const Knex = require("knex");
const settings = {
  client: "mysql",
  version: "5.7",
  connection: {
    host : environment.database.host,
    user : environment.database.user,
    password : environment.database.password,
    database : environment.database.database
  },
  pool: {
    min: 0,
    max: 10
  }
};


class AVAQueryBuilder {
  
  constructor() {
    this.SELECTED = false;
  }

  init() {
    const knexInstance = Knex(settings);
    this.chain = knexInstance(this.NAME);
  }

  select() {
    var properties = [];
    var fields = [];
    properties = arguments;
    if (properties.length === 0) {
      properties = Object.keys(this.PROPERTIES);
    }
    for (const arg of properties) {
      if (arg.includes("AS")) {
        const sections = arg.split("AS");
        if (sections.length === 2) {
          const property = sections[0].trim();
          const field = this.PROPERTIES[property].name;
          const alias = sections[1].trim();
          fields.push(`${field} AS ${alias}`);
        } else {
          continue;
        }
      } else {
        const property = arg;
        const field = this.PROPERTIES[property].name;
        const alias = property;
        fields.push(`${field} AS ${alias}`);
      }
    }
    this.SELECTED = true;
    this.chain = this.chain.select(...fields);
    return this;
  }
  
  where() {
    if (typeof arguments[0] === "string") {
      if (arguments[0] in this.PROPERTIES) {
        arguments[0] = this.PROPERTIES[arguments[0]].name;
      }
    }
    if (!this.SELECTED) {
      this.select();
    }
    this.chain = this.chain.where(...arguments);
    return this;
  }

  then() {
    this.chain = this.chain.then(...arguments);
    return this;
  }

  fetch({onSuccess, onFailure}) {
    this.chain = this.chain.then((value) => {
      const result = Array.isArray(value) ? {results: value} : {result: value};
      onSuccess(result);
    });
    this.chain.catch((error) => {
      onFailure({ errors: [{ error: "databaseError", code: error.code }] })
    });
    return this;
  }

}

module.exports = AVAQueryBuilder;