import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

const formatIssues = (error) =>
  error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(
      new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        formatIssues(result.error),
      ),
    );
  }
  req.body = result.data; // cleaned data: unknown fields are stripped
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(
      new AppError(
        "Invalid query",
        400,
        "VALIDATION_ERROR",
        formatIssues(result.error),
      ),
    );
  }
  req.validatedQuery = result.data;
  next();
};

export const validateObjectId =
  (param = "id") =>
  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) {
      return next(new AppError("Invalid id", 400, "INVALID_ID"));
    }
    next();
  };
