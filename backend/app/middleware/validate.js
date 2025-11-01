// A generic middleware to execute a list of validation functions/promises
// and handle the response if validation fails.
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all async validation functions sequentially
      for (const validator of validations) {
        await validator(req, res, next);
      }
      // If all passed, call next() again to proceed to the controller
      next(); 
    } catch (error) {
      // The individual validator functions are responsible for sending a 400/500 status 
      // and ending the request using return res.status(...).send(...);
      // If an error is thrown here (which shouldn't happen if validators return on failure), 
      // we'll handle it generically.
      if (!res.headersSent) {
        console.error("Validation execution error:", error);
        return res.status(500).send({ message: "Internal server error during validation." });
      }
    }
  };
};

export default validate;