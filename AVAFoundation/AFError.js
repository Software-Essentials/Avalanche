

/**
 * @description Collection of errorcodes.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AFError extends Error {

  constructor() {
    const message = typeof arguments[0] === "string" ? arguments[0] : undefined;
    if (message) {
      super(message);
    } else {
      super();
    }
  }

}

AFError.NOTANAVAPROJECT = 1;
AFError.NOENV = 2;
AFError.ENVINVALID = 3;
AFError.AVAALREADYINIT = 4;
AFError.INCOMPLETECORE = 5;


export default AFError
export const NOTANAVAPROJECT = 1;
export const NOENV = 2;
export const ENVINVALID = 3;
export const AVAALREADYINIT = 4;
export const INCOMPLETECORE = 5;