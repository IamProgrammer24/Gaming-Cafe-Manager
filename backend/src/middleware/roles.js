import { AppError } from "../utils/AppError.js";

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to do this", 403, "FORBIDDEN"),
      );
    }
    next();
  };
