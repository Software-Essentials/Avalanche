// Dependencies
const fs = require("fs");


/**
 * 
 */
class AVALocalisation {

  constructor(locale) {
    var normalizedPath = `${projectPWD}/app/localisations`;
    var localisations = [];
    if (fs.existsSync(normalizedPath)) {
      fs.readdirSync(normalizedPath).forEach(function (file) {
        const extensions = file.split(".");
        if(extensions.length === 2)
          if(extensions[extensions.length - 1].toUpperCase() === "JSON")
            localisations[extensions[0]] = require(`${projectPWD}/app/localisations/${file}`);
      });
      this.list = localisations[locale];
    } else {
      this.list = null;
    }
  }


  getList() {
    return this.list;
  }

}


AVALocalisation.translate = (context) => {
  const localisation = new AVALocalisation("en_GB");
  const locale = localisation.getList();
  return typeof locale[context] === "string" ? locale[context] : context;
};


module.exports = AVALocalisation;