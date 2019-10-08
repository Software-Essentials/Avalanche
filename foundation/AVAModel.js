const AVAQueryBuilder = require("./AVAQueryBuilder");

/**
 * Super model
 */
class AVAModel extends AVAQueryBuilder {

  /**
   * @param {String} name Name of the resource.
   * @throws {Error}
   */
  constructor() {
    super();
    this.NAME = null;
    this.PROPERTIES = null
    this.DRAFT = false;
    this.IDENTIFIER = null;
    this.METHOD = null;
  }

  setupDone() {
    super.init();
  }

}

AVAModel.register = (model) => { return model };

module.exports = AVAModel;