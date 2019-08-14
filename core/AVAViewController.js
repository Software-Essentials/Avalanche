// Imports
const { Controller } = require("../index.js");



/**
 * Super view controller
 */
class AVAViewController extends Controller {

    constructor(callback) {
        super();
        
        this.permission = null;
        this.layout = null;
        this.template = "viewControllerView";
        this.tabs = [];
        this.modals = [];
        this.variables = {};
        
        callback(this.willLoad, this);
        
    }

    /**
     * Fires when view is about to load
     */
    willLoad(request, response, self) {

        self.request = request;
        self.response = response;
        
        // const user = self.request.session.user;
        const layout = typeof(self.layout) === "string" ? self.layout + ".layout.hbs" : "layout.hbs"
        const template = self.template + ".hbs";
        var vars = self.variables;
        vars.layout = layout;
        self.response.render(template, vars);

        self.didLoad();
        return;
    }

    /**
     * Fires when view has loaded
     */
    didLoad() {
    }

}



module.exports = AVAViewController