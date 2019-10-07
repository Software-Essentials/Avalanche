


/**
 * 
 */
class AVAValidator {

  constructor(request) {
    this.invalid = { body: {}, query: {}, param: {} };
    request.body.validate = (key) => {
      this.key = key
      this.scope = "body";
      this.value = request.body[key];
      return this;
    }
    request.query.validate = (key) => {
      this.key = key
      this.scope = "query";
      this.value = request.query[key];
      return this;
    }
    request.param.validate = (key) => {
      this.key = key
      this.scope = "param";
      this.value = request.param[key];
      return this;
    }
    request.validate = ({onFailure}) => {
      var failures = [];
      for(const method of Object.keys(this.invalid)) {
        for(const key in this.invalid[method]) {
          for(const condition in this.invalid[method][key]) {
            const conditionValue = this.invalid[method][key][condition];
            switch(condition) {
              case "type":
                failures.push({field: key, scope: method, error: "invalidType", message: `Type of '${key}' must be '${conditionValue}'.`});
                break;
              case "length":
                failures.push({field: key, scope: method, error: "invalidLength", message: `Length of '${key}' must be ${conditionValue}.`});
                break;
              case "range":
                failures.push({field: key, scope: method, error: "invalidLength", message: `Length of '${key}' must be in range ${conditionValue}.`});
                break;
              case "greaterThan":
                failures.push({field: key, scope: method, error: "invalidLength", message: `Length of '${key}' must be greater than ${conditionValue}.`});
                break;
              case "LessThan":
                errors.push()
                failures.push({field: key, scope: method, error: "invalidLength", message: `Length of '${key}' must be less than ${conditionValue}.`});
                break;
            }
          }
        }
      }
      if (failures.length <= 0) return true;
      onFailure({error: new Error("Validation failed"), errors: failures})
      return false;
    }
  }

  type(type) {
    if (type === "number" && parseInt(this.value) !== NaN) {
      return this;
    }
    if (type === "string" && typeof this.value === "string") {
      return this;
    }
    if (type === "boolean" && (
      this.value.toLowerCase() === "false" ||
      this.value.toLowerCase() === "true" ||
      this.value === "1"  ||
      this.value === "0" ||
      this.value === 1  ||
      this.value === 0
    )) {
      return this;
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].type = type;
    return this;
  }

  range(min, max) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length >= min && this.value.length <= max) {
        return this;
      }
    }
    const value = parseInt(this.value);
    if (value !== NaN) {
      if (value >= min && value <= max) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].range = `${min}-${max}`;
    return this;
  }

  length(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length == number) {
        return true;
      }
    }
    if (typeof this.value === "number") {
      if (this.value == number) {
        return true;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].length = number;
    return false;
  }

  greaterThan(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length > number) {
        return this;
      }
    }
    if (typeof this.value === "number") {
      if (this.value > number) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].greaterThan = number;
    return this;
  }

  lessThan(number) {
    if (Array.isArray(this.value) || typeof this.value === "string") {
      if (this.value.length < number) {
        return this;
      }
    }
    if (typeof this.value === "number") {
      if (this.value < number) {
        return this;
      }
    }
    this.invalid[this.scope][this.key] = Array.isArray(this.invalid[this.scope][this.key]) ? this.invalid[this.scope][this.key] : [];
    this.invalid[this.scope][this.key].lessThan = number;
    return this;
  }

}


module.exports = AVAValidator;