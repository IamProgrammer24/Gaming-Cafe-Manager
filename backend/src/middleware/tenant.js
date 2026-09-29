import { AppError } from "../utils/AppError.js";

// Every café route must pass through this. It guarantees req.cafeId
// exists and comes from the verified user record, never from the request.
export function requireCafe(req, res, next) {
  if (!req.user || !req.user.cafeId) {
    return next(
      new AppError("No café is linked to this account", 403, "NO_CAFE"),
    );
  }
  req.cafeId = req.user.cafeId;
  next();
}
