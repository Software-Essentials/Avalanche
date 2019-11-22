import fs from "fs";
import path from "path";


/**
 * @description Removes a directory recursively.
 * @param {String} filePath
 */
export function rmdirSyncRecursive(filePath) {
  var files = [];
  if (fs.existsSync(filePath)) {
    files = fs.readdirSync(filePath);
    files.forEach(function (file, index) {
      var curPath = filePath + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        rmdirSyncRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(filePath);
  }
};


/**
 * @param {String} versionValue 
 * @returns {Boolean}
 */
export function isSemVer(versionValue) {
  const splittedValue = versionValue.split(".");
  const parsedValue = parseInt(splittedValue.join(""));
  if (splittedValue.length === 3 && typeof parsedValue === "number" && parsedValue !== NaN) {
    return true;
  }
  return false;
}


/**
 * @description Loops to map a full directory structure until it is done.
 * @param {String} filename Name of the directory to map.
 * @param {Object} previousChildren Collection of the results of the previous scan.
 * @returns {Object}
 */
export function directoryLooper(filename, previousChildren) {
  var children = previousChildren;
  children.push(filename);
  var stats = fs.lstatSync(filename),
    info = {
      path: filename,
    };
  if (stats.isDirectory()) {
    info.children = fs.readdirSync(filename).map(function (child) {
      const tree = directoryLooper(filename + "/" + child, children);
      return tree.info;
    });
  }

  return { info: info, children: children };
}


/**
 * @description Creates directory tree if needed
 * @param {String} filePath
 */
export function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}


/**
 * Creates and formats a UUID from a given string, or generates a new UUID.
 */
export function UUID() {
  if (typeof (arguments[0]) === "string" && arguments[0].length === 36 && arguments[0].substring(8, 9) === "-" && arguments[0].substring(13, 14) === "-" && arguments[0].substring(14, 15) === "4" && arguments[0].substring(18, 19) === "-" && arguments[0].substring(23, 24) === "-") {
    this.string = arguments[0].toUpperCase();
  } else {
    var dt = new Date().getTime();
    this.string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
    }).toUpperCase();
  }
}


/**
 * 
 */
export function getOSFromUserAgent(ua) {
  if (ua.includes("Mac OS X")) {
    return "Mac OS X";
  }
  if (ua.includes("Windows")) {
    return "Windows";
  }
  if (ua.includes("iPhone OS")) {
    return "iOS";
  }
  return null;
}


/**
 * 
 */
export function getBrowserFromUserAgent(ua) {
  if (ua.includes("Safari")) {
    return "Safari";
  }
  if (ua.includes("Firefox")) {
    return "Firefox";
  }
  if (ua.includes("Chrome")) {
    return "Chrome";
  }
  return null;
}


/**
 *
 */
export function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 * @description Checks if a string is an email.
 * @param {String} email Email string.
 */
export function isEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}