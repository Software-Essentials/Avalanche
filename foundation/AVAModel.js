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

AVAModel.register = (Model) => {
  const model = new Model();
  Model.PROPERTIES = model.PROPERTIES;
  Model.IDENTIFIER = model.IDENTIFIER;
  Model.METHOD = model.METHOD;
  Model.DRAFT = model.DRAFT;
  Model.NAME = model.NAME;
  return Model
};

module.exports = AVAModel;