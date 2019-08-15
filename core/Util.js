

/**
 * Creates and formats a UUID from a given string, or generates a new UUID.
 */
function UUID() {
  if(typeof(arguments[0]) === "string" && arguments[0].length === 36 && arguments[0].substring(8, 9) === "-" && arguments[0].substring(13, 14) === "-" && arguments[0].substring(14, 15) === "4" && arguments[0].substring(18, 19) === "-" && arguments[0].substring(23, 24) === "-") {
    this.string = arguments[0].toUpperCase();
  } else {
    var dt = new Date().getTime();
    this.string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r :(r&0x3|0x8)).toString(16);
    }).toUpperCase();
  }
}


/**
 * 
 */
function getOSFromUserAgent(ua) {
  if(ua.includes("Mac OS X")) {
    return "Mac OS X";
  }
  if(ua.includes("Windows")) {
    return "Windows";
  }
  if(ua.includes("iPhone OS")) {
    return "iOS";
  }
  return null;
}


/**
 * 
 */
function getBrowserFromUserAgent(ua) {
  if(ua.includes("Safari")) {
    return "Safari";
  }
  if(ua.includes("Firefox")) {
    return "Firefox";
  }
  if(ua.includes("Chrome")) {
    return "Chrome";
  }
  return null;
}


module.exports = {
  UUID: UUID,
  getOSFromUserAgent: getOSFromUserAgent,
  getBrowserFromUserAgent: getBrowserFromUserAgent
}
