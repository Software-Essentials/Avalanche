import fs from "fs";
import https from "https";
import inquirer from "inquirer";
import querystring from "querystring";
import Table from "cli-table";
import * as ACUtil from "../../AVACore/ACUtil";
import { request } from "express";
import { isObject } from "util";
import HTTPRequest from "request";

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
    var interval = 0;
    for (const index in localisations) {
      const localisation = localisations[index];
      const language = localisation.split("_")[0].toLowerCase();
      const destination = `${projectPWD}/app/localisations/${localisation}.json`;
      handleFile(destination, language, masterLanguage, targetLine, overwriteLines, interval, (newInterval) => {
        interval = newInterval;
      });
    }
  });
}

function handleFile(destination, language, masterLanguage, targetLine, overwriteLines, interval, setNewInterval) {
  var content = {};
  try {
    content = require(destination);
  } catch (exception) {
    fs.writeFileSync(destination, JSON.stringify({}, null, 2), { encoding: "utf8" });
  }
  for (const line in targetLine) {
    if (!overwriteLines && content.hasOwnProperty(line)) {
      continue;
    }
    setTimeout(() => {
      translate(targetLine[line], masterLanguage, language, (data) => {
        update(line, data);
      });
    }, interval);
    setNewInterval(interval + 1000);
  }
  function update(key, value) {
    content[key] = value;
    content = Object.keys(content).sort().reduce((r, k) => (r[k] = content[k], r), {});
    fs.writeFileSync(destination, JSON.stringify(content, null, 2), { encoding: "utf8" });
  }
}

function translate(text, from, to, callback) {
  const onReady = typeof callback === "function" ? callback : () => { };

  HTTPRequest(`https://translate.googleapis.com/translate_a/single?client=${"gtx"}&dt=${"t"}&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`, {}, (error, resp, body) => {
    if (error) {
      console.log(error);
      onReady("__FAILED__");
      return;
    }
    try {
      onReady(JSON.parse(body)[0][0][0]);
    } catch (error) {
      if (resp.statusCode === 429) {
        console.log("Google translate is blocking requests");
      }
      onReady("__FAILED__");
    }
  });
};


module.exports.execute = localise;
module.exports.enabled = false;
module.exports.requireEnvironment = false;
module.exports.scope = "PROJECT";
module.exports.command = "localise";
module.exports.description = "Creates localisations";