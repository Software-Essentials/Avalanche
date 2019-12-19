import fs from "fs";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFLocalisation {

  /**
   * 
   * @param {String} language For example: en
   * @param {String} region For example: UK
   */
  constructor(language, region) {
    var normalizedPath = `${projectPWD}/app/localisations`;
    var localisations = [];
    if (fs.existsSync(normalizedPath)) {
      fs.readdirSync(normalizedPath).forEach(function (file) {
        const extensions = file.split(".");
        if (extensions.length === 2)
          if (extensions[extensions.length - 1].toUpperCase() === "JSON")
            localisations[extensions[0]] = require(`${projectPWD}/app/localisations/${file}`);
      });
      this.list = localisations[language];
    } else {
      this.list = null;
    }
  }


  getList() {
    return this.list;
  }


  _(context) {
    console.log(context, "=>", context);
    return typeof this.list[context] === "string" ? this.list[context] : context;
  };

}


export function translate(context) {
  const localisation = new AFLocalisation("en");
  const locale = localisation.getList();
  return typeof locale[context] === "string" ? locale[context] : context;
};


export default AFLocalisation;