// AVAFoundation
export const AFPushNotification = require("./AVAFoundation/AFPushNotification").default;
export const AFRecordZoneType = require("./AVAFoundation/AFRecordZoneType").default;
export const AFLocalisation = require("./AVAFoundation/AFLocalisation").default;
export const AFQueryBuilder = require("./AVAFoundation/AFQueryBuilder").default;
export const AFEnvironment = require("./AVAFoundation/AFEnvironment").default;
export const AFRecordZone = require("./AVAFoundation/AFRecordZone").default;
export const AFValidator = require("./AVAFoundation/AFValidator").default;
export const AFDatabase = require("./AVAFoundation/AFDatabase").default;
export const AFStorage = require("./AVAFoundation/AFStorage").default;
export const AFMailer = require("./AVAFoundation/AFMailer").default;
export const AFEMail = require("./AVAFoundation/AFEMail").default;
export const AFError = require("./AVAFoundation/AFError").default;
export const AFUtil = require("./AVAFoundation/AFUtil");

// Super components
export const AFViewController = require("./AVAFoundation/AFViewController").default;
export const AFController = require("./AVAFoundation/AFController").default;
export const AFMiddleware = require("./AVAFoundation/AFMiddleware").default;
export const AFModel = require("./AVAFoundation/AFModel").default;

// Component loaders
export const helper = (name) => { return require(`${projectPWD}/app/helpers/${name}`).default; };
export const structure = (name) => { return require(`${projectPWD}/app/structures/${name}`); };