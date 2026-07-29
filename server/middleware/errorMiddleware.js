// Central error handler. Every thrown/rejected error lands here. It maps the
// common error shapes (AppError, multer, Mongoose, JWT) to sensible HTTP
// statuses and never returns the raw error object to the client.
const AppError = require("../utils/AppError");

const notFound = (req, res, next) => next(new AppError(`Not found: ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // multer limit / filter errors → 400
  if (err.code && typeof err.code === "string" && err.code.startsWith("LIMIT_")) {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE"
      ? "File too large."
      : "Invalid upload.";
  }

  // Mongoose validation
  if (err.name === "ValidationError") statusCode = 400;

  // Duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists.";
  }

  // JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired.";
  }

  // Cast error (bad ObjectId etc.)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier.";
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };