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
 * @param {Object} request 
 * @returns {Boolean}
 */
export function isFromBrowser(request) {
  const headers = request.headers;
  if (headers["x-requested-with"] === "XMLHttpRequest") {
    return false;
  }
  if (headers["authorization"]) {
    return false;
  }
  return true;
}


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
 * @param {String} ua User agent
 * @returns {String|null} OS name
 */
export function getOSFromUserAgent(ua) {
  const oses = {
    "Mac OS X": "macOS",
    "iPhone OS": "iOS",
    "Windows NT": "Windows",
    "Android": "Android",
    "Linux": "Linux"
  };
  for (const os of Object.keys(oses)) {
    if (ua.includes(os)) {
      const name = oses[os];
      const version = ua.split(os)[1].split(";")[0].split(")")[0].trim().split("_").join(".");
      return {
        name, version
      }
    }
  }
  return { name: null, version: null };
}


/**
 * @param {String} ua User agent
 * @returns {String|null} Browser name
 */
export function getBrowserFromUserAgent(ua) {
  var tem, M = ua.match(/(postmanruntime|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+(\.\d+)?(\.\d+)?)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return {
      name: "IE",
      version: (tem[1] || null)
    };
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\bOPR|Edge\/(\d+)/)
    if (tem != null) {
      return {
        name: "Opera",
        version: tem[1]
      };
    }
  }
  M = M[2] ? [M[1], M[2]] : [null, null, "-?"];
  if (M[0] === "PostmanRuntime") {
    return {
      name: "Postman",
      version: M[1]
    };
  }
  if ((tem = ua.match(/version\/(.+?(?= ))/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return {
    name: M[0],
    version: M[1]
  };
}


/**
 * @param {String} model Device model code
 * @returns {String|null} Device name
 */
export function getModelName(model) {
  const full = !!arguments[1];
  switch (model) {
    case "iPod5,1": return `iPod touch${full ? " (5th generation)" : ""}`;
    case "iPod7,1": return `iPod touch${full ? " (6th generation)" : ""}`;
    case "iPod9,1": return `iPod touch${full ? " (7th generation)" : ""}`;
    case "iPhone3,1": case "iPhone3,2": case "iPhone3,3": return "iPhone 4";
    case "iPhone4,1": return "iPhone 4s";
    case "iPhone5,1": case "iPhone5,2": return "iPhone 5";
    case "iPhone5,3": case "iPhone5,4": return "iPhone 5c";
    case "iPhone6,1": case "iPhone6,2": return "iPhone 5s";
    case "iPhone7,2": return "iPhone 6";
    case "iPhone7,1": return "iPhone 6 Plus";
    case "iPhone8,1": return "iPhone 6s";
    case "iPhone8,2": return "iPhone 6s Plus";
    case "iPhone9,1": case "iPhone9,3": return "iPhone 7";
    case "iPhone9,2": case "iPhone9,4": return "iPhone 7 Plus";
    case "iPhone8,4": return "iPhone SE";
    case "iPhone10,1": case "iPhone10,4": return "iPhone 8";
    case "iPhone10,2": case "iPhone10,5": return "iPhone 8 Plus";
    case "iPhone10,3": case "iPhone10,6": return "iPhone X";
    case "iPhone11,2": return "iPhone XS";
    case "iPhone11,4": case "iPhone11,6": return "iPhone XS Max";
    case "iPhone11,8": return "iPhone XR";
    case "iPhone12,1": return "iPhone 11";
    case "iPhone12,3": return "iPhone 11 Pro";
    case "iPhone12,5": return "iPhone 11 Pro Max";
    case "iPad2,1": case "iPad2,2": case "iPad2,3": case "iPad2,4": return "iPad 2";
    case "iPad3,1": case "iPad3,2": case "iPad3,3": return `iPad${full ? " (3rd generation)" : ""}`;
    case "iPad3,4": case "iPad3,5": case "iPad3,6": return `iPad${full ? " (4th generation)" : ""}`;
    case "iPad6,11": case "iPad6,12": return `iPad${full ? " (5th generation)" : ""}`;
    case "iPad7,5": case "iPad7,6": return `iPad${full ? " (6th generation)" : ""}`;
    case "iPad7,11": case "iPad7,12": return `iPad${full ? " (7th generation)" : ""}`;
    case "iPad4,1": case "iPad4,2": case "iPad4,3": return "iPad Air";
    case "iPad5,3": case "iPad5,4": return "iPad Air 2";
    case "iPad11,4": case "iPad11,5": return `iPad Air${full ? " (3rd generation)" : ""}`;
    case "iPad2,5": case "iPad2,6": case "iPad2,7": return "iPad mini";
    case "iPad4,4": case "iPad4,5": case "iPad4,6": return "iPad mini 2";
    case "iPad4,7": case "iPad4,8": case "iPad4,9": return "iPad mini 3";
    case "iPad5,1": case "iPad5,2": return `iPad mini${full ? " (4th generation)" : ""}`;
    case "iPad11,1": case "iPad11,2": return `iPad mini${full ? " (5th generation)" : ""}`;
    case "iPad6,3": case "iPad6,4": return `iPad Pro${full ? " (9.7-inch)" : ""}`;
    case "iPad7,3": case "iPad7,4": return `iPad Pro${full ? " (10.5-inch)" : ""}`;
    case "iPad8,1": case "iPad8,2": case "iPad8,3": case "iPad8,4": return `iPad Pro${full ? " (11-inch)" : ""}`;
    case "iPad8,9": case "iPad8,10": return `iPad Pro${full ? " (11-inch) (2nd generation)" : ""}`;
    case "iPad6,7": case "iPad6,8": return `iPad Pro${full ? " (12.9-inch)" : ""}`;
    case "iPad7,1": case "iPad7,2": return `iPad Pro${full ? " (12.9-inch) (2nd generation)" : ""}`;
    case "iPad8,5": case "iPad8,6": case "iPad8,7": case "iPad8,8": return `iPad Pro${full ? " (12.9-inch) (3rd generation)" : ""}`
    case "iPad8,11": case "iPad8,12": return `iPad Pro${full ? " (12.9-inch) (4th generation)" : ""}`;
    case "AppleTV5,3": return "Apple TV";
    case "AppleTV6,2": return "Apple TV 4K";
    case "AudioAccessory1,1": return "HomePod";
  }
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


/**
 * @description Parses any value to a value of type boolean.
 * @param {mixed} value value.
 * @returns {boolean}
 */
export function parseBoolean(value) {
  return ((typeof value === "string" && value.toLowerCase() === "false") || value === "0") ? false : !!value;
}


export default null;