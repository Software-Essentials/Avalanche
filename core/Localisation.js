// Dependencies
const fs = require("fs");
const path = require("path");


/**
 * 
 */
class Localisation {

    constructor(locale) {

        var normalizedPath = path.join(__dirname, "../app/localisations");
        var localisations = [];
        fs.readdirSync(normalizedPath).forEach(function (file) {
            const extensions = file.split(".");
            if(extensions.length === 2)
                if(extensions[extensions.length - 1].toUpperCase() === "JSON")
                    localisations[extensions[0]] = require("../app/localisations/" + file);
        });
        this.list = localisations[locale];
    }

    getList() {
        return this.list;
    }

}

module.exports = Localisation;