import fs from "fs";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFLocalisation {

  /**
   * 
   * @param {String} locale For example: en_GB
   */
  constructor(locale) {
    var normalizedPath = `${projectPWD}/app/localisations`;
    var localisations = [];
    if (fs.existsSync(normalizedPath)) {
      fs.readdirSync(normalizedPath).forEach((file) => {
        const extensions = file.split(".");
        if (extensions.length === 2)
          if (extensions[extensions.length - 1].toUpperCase() === "JSON")
            localisations[extensions[0]] = require(`${projectPWD}/app/localisations/${file}`);
      });
      this.list = localisations[locale] || {};
    } else {
      this.list = {};
    }
  }


  getList() {
    return this.list;
  }
  

  translate(context) {
    return typeof (this.list || {})[context] === "string" ? this.list[context] : context;
  }

}


export default AFLocalisation;