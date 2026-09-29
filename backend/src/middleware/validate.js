import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(
      new AppError("Validation failed", 400, "VALIDATION_ERROR", details),
    );
  }
  req.body = result.data; // cleaned data: unknown fields are stripped
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
