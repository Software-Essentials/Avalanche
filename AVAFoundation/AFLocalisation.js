import fs from "fs";


/**
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFLocalisation {

  /**
   * 
   * @param {String} locale For example: en_GB
   */
  constructor() {
  }

}

AFLocalisation.translate = (context, locale) => {
  var normalizedPath = `${projectPWD}/app/localisations`;
  var translations = {};
  if (fs.existsSync(`${normalizedPath}/${locale}.json`)) {
    translations = require(`${normalizedPath}/${locale}.json`);
  } else {
    translations = require(`${normalizedPath}/en_GB.json`);
  }
  if (!translations.hasOwnProperty(context)) {
    return context;
  }
  return translations[context];
}


export default AFLocalisation;