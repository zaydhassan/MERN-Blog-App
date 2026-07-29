// Operational error with an attached HTTP status. Throwing AppError lets a
// controller signal a clean 4xx (e.g. "Not found", "Forbidden") that the
// global error handler turns into a JSON response without leaking internals.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;