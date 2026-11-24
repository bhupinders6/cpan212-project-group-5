export function validate(schema) {
  return function (req, res, next) {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next({ 
        status: 400, 
        message: "Validation failed", 
        details: err.errors 
      });
    }
  };
}