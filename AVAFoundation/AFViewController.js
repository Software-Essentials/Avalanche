import AFController from "./AFController";


/**
 * @deprecated
 * @description Super view controller
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFViewController extends AFController {

  constructor(callback) {
    super();

    this.layout = null;
    this.template = "viewControllerView";
    this.variables = {};

    callback(this.willLoad, this);
  }


  /**
   * Fires when view is about to load
   */
  willLoad(request, response, self) {

    self.request = request;
    self.response = response;

    const layout = typeof (self.layout) === "string" ? self.layout + ".layout.hbs" : "layout.hbs"
    const template = self.template + ".hbs";
    var vars = self.variables;
    vars.layout = layout;
    if (environment.security.csrf) {
      vars.CSRF = request.csrfToken();
    }
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


export default AFViewController;