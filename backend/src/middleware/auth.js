import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { User } from "../modules/auth/user.model.js";

export async function protect(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new AppError("Please log in", 401, "UNAUTHENTICATED");
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtAccessSecret);
    } catch (e) {
      if (e.name === "TokenExpiredError") {
        throw new AppError("Token expired", 401, "TOKEN_EXPIRED");
      }
      throw new AppError("Invalid token", 401, "UNAUTHENTICATED");
    }

    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive) {
      throw new AppError(
        "Account not found or disabled",
        401,
        "UNAUTHENTICATED",
      );
    }

    // cafeId comes from the database, never from the request body
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cafeId: user.cafeId,
    };
    next();
  } catch (err) {
    next(err);
  }
}
