import fs from "fs";
import http from "http";
import inquirer from "inquirer";
import querystring from "querystring";
import Table from "cli-table";
import * as ACUtil from "../../AVACore/ACUtil";
import { request } from "express";
import { isObject } from "util";

const avalanchePackage = require("../../package.json");
const pkg = fs.existsSync(`${projectPWD}/package.json`) ? require(`${projectPWD}/package.json`) : undefined;
const clientId = "FREE_TRIAL_ACCOUNT";
const clientSecret = "PUBLIC_SECRET";


/**
 * @description Prints information about the current Avalanche version and about the project.
 */
function localise() {
  const overwriteLines = false;
  var localisations = ACUtil.getLocalisations();
  const questions = [
    {
      type: "list",
      name: "localisation",
      choices: localisations,
      message: "Choose target localisation to translate from:",
      prefix: `${ACUtil.terminalPrefix()}\x1b[34m`,
      suffix: "\x1b[0m"
    }
  ];
  inquirer.prompt(questions).then(answers => {
    const masterLocalisation = answers.localisation;
    const masterLanguage = masterLocalisation.split("_")[0].toLowerCase();
    for (const index in localisations) {
      if (localisations[index] == masterLocalisation) {
        localisations.splice(index, 1);
      }
    }
    const targetLine = require(`${projectPWD}/app/localisations/${masterLocalisation}.json`);
    for (const index in localisations) {
      const localisation = localisations[index];
      const language = localisation.split("_")[0].toLowerCase();
      const destination = `${projectPWD}/app/localisations/${localisation}.json`;
      var content = {};
      try {
        content = require(destination);
      } catch (exception) {

      }
      for (const line in targetLine) {
        if (!overwriteLines && content.hasOwnProperty(line)) {
          continue;
        }
        translate(targetLine[line], masterLanguage, language, (data) => {
          update(localisation, line, data);
        });
      }
      function update(localisation, key, value) {
        content[key] = value;
        content = Object.keys(content).sort().reduce((r, k) => (r[k] = content[k], r), {});
        fs.writeFileSync(destination, JSON.stringify(content, null, 2), { encoding: "utf8" });
      }
    }
  });
}

function translate(text, from, to, callback) {
  const onReady = typeof callback === "function" ? callback : () => { };

  const jsonPayload = JSON.stringify({
    fromLang: from,
    toLang: to,
    text: text
  });

  const options = {
    hostname: "api.whatsmate.net",
    port: 80,
    path: "/v1/translation/translate",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WM-CLIENT-ID": clientId,
      "X-WM-CLIENT-SECRET": clientSecret,
      "Content-Length": Buffer.byteLength(jsonPayload)
    }
  };

  const request = new http.ClientRequest(options);
  request.end(jsonPayload);
  request.on("response", (response) => {
    var data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });
    response.on("end", () => {
      if (response.statusCode === 200) {
        onReady(data);
      } else {
        console.log("Error: ", data);
      }
    });
  });
  request.on("error", (error) => {
    console.log(`Error: ${error}`);
  });
};


module.exports.execute = localise;
module.exports.enabled = true;
module.exports.scope = "PROJECT";
module.exports.command = "localise";
module.exports.description = "Creates localisations";