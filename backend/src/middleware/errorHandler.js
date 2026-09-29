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
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message:
        statusCode === 500 && env.nodeEnv === "production"
          ? "Something went wrong"
          : err.message,
    },
  });
}
