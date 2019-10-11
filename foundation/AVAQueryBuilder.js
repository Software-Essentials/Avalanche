const Knex = require("knex");


class AVAQueryBuilder {
  
  /**
   * @param {Object} options Optional object containing options.
   */
  constructor(table) {
    const options = arguments[0] ? arguments[0] : null;
    this.kConfig = {
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
    this.NAME = table;
    this.SELECTED = false;
    this.finished = false;
    this.onSuccess = options ? typeof options.onSuccess === "function" ? options.onSuccess : () => { } : () => { };
    this.onFailure = options ? typeof options.onFailure === "function" ? options.onFailure : () => { } : () => { };
  }

  init() {
    const knexInstance = Knex(this.kConfig);
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
    if (typeof arguments[0] === "object" && "onSuccess" in arguments[0]) {
      this.chain = this.chain.then((value) => {
        this.onSuccess = arguments[0] ? typeof arguments[0].onSuccess === "function" ? arguments[0].onSuccess : () => { } : () => { };
        const result = Array.isArray(value) ? {results: value} : {result: value};
        if (!this.finished) {
          this.onSuccess(result);
          this.finished = true;
        }
      });
    } else {
      this.chain = this.chain.then(...arguments);
    }
    return this;
  }

  fetch({onSuccess, onFailure}) {
    this.onSuccess = typeof onSuccess === "function" ? onSuccess : () => { };
    this.onFailure = typeof onFailure === "function" ? onFailure : () => { };
    this.chain = this.chain.then((value) => {
      const result = Array.isArray(value) ? {results: value} : {result: value};
      if (!this.finished) {
        this.onSuccess(result);
        this.finished = true;
      }
    });
    this.chain.catch((error) => {
      if (!this.finished) {
        this.onFailure({ errors: [{ error: "databaseError", code: error.code }] })
        this.finished = true;
      }
    });
    return this;
  }
  
  catch() {
    if (typeof arguments[0] === "object" && "onFailure" in arguments[0]) {
      this.chain = this.chain.then((value) => {
        this.onFailure = arguments[0] ? typeof arguments[0].onFailure === "function" ? arguments[0].onFailure : () => { } : () => { };
        const result = Array.isArray(value) ? {results: value} : {result: value};
        if (!this.finished) {
          this.onFailure(result);
          this.finished = true;
        }
      });
    } else {
      this.chain = this.chain.catch(...arguments);
    }
    return this;
  }
  
  insert() {
    this.chain = this.chain.catch(...arguments);
    return this;
  }

}


module.exports = AVAQueryBuilder;