export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: "Route not found"
    }
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  const details = err.details || undefined;

 const response = {
        error: {
            message: message
        }
    };

  if (details) {
    response.error.details = details;
  }

  res.status(status).json(response);
}