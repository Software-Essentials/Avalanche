

/**
 * @description Collection of errorcodes.
 * @author Lawrence Bensaid <lawrencebensaid@icloud.com>
 */
class AVAError extends Error {

  constructor() {
    const message = typeof arguments[0] === "string" ? arguments[0] : undefined;
    if (message) {
      super(message);
    } else {
      super();
    }
  }

}

AVAError.NOTANAVAPROJECT = 1;
AVAError.NOENV = 2;
AVAError.ENVINVALID = 3;
AVAError.AVAALREADYINIT = 4;
AVAError.INCOMPLETECORE = 5;


export default AVAError
export const NOTANAVAPROJECT = 1;
export const NOENV = 2;
export const ENVINVALID = 3;
export const AVAALREADYINIT = 4;
export const INCOMPLETECORE = 5;