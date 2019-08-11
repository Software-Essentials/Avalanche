// Imports
const Controller = require("./AVAController.js");



/**
 * Super view controller
 */
class AVAViewController extends Controller {

    constructor(callback) {
        super();
        
        this.permission = null;
        this.layout = null;
        this.template = "viewControllerView";
        this.tabs = [
            {
                name: "defaultTab",
                title: "Empty",
                active: true,
                options: []
            }
        ];
        this.modals = [];
        
        callback(this.willLoad, this);
        
    }

    /**
     * Fires when view is about to load
     */
    willLoad(request, response, self) {

        self.request = request;
        self.response = response;

        
        if(self.permission && request.auth && !request.auth.permissions.includes(self.permission)) {
            const layout = typeof(self.layout) === "string" ? self.layout + ".layout.hbs" : "layout.hbs"
            self.response.status(403);
            self.response.render("status/403.hbs", {
                layout: layout
            });
            return;
        }
        
        if(typeof(self.request.session.user) === "undefined") {
            var rendererOptions = {};
            const template = self.template + ".hbs";
            rendererOptions.layout = typeof(self.layout) === "string" ? self.layout + ".layout.hbs" : "layout.hbs"
            self.response.render(template, rendererOptions);
            self.didLoad();
            return;
        } else {
            const user = self.request.session.user;
            const layout = typeof(self.layout) === "string" ? self.layout + ".layout.hbs" : "layout.hbs"
            const template = self.template + ".hbs";
            self.response.render(template, {
                userCompany: user.company,
                userFirstname: user.firstname,
                userLastname: user.lastname,
                userTitle: user.title,
                layout: layout,
                tabs: self.tabs,
                modals: self.modals,
                customModals: self.customModals
            });
            self.didLoad();
            return;
        }
    }

    /**
     * Fires when view has loaded
     */
    didLoad() {
    }

}



module.exports = AVAViewController