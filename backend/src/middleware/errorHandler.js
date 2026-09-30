import { env } from "../config/env.js";

export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = typeof err.code === "string" ? err.code : "INTERNAL_ERROR";
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Request body is not valid JSON";
  }
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_VALUE";
    message = "A record with this value already exists";
  }

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Validation failed";
    err.details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_VALUE";
    message = `Invalid value for ${err.path}`;
  }

  if (statusCode === 500) {
    console.error(err);
    if (env.nodeEnv === "production") message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(err.details && { details: err.details }) },
  });
}
