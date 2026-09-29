import { AppError } from "../utils/AppError.js";
import { Cafe } from "../modules/cafes/cafe.model.js";
import { getEffectiveStatus } from "../utils/subscription.js";

export async function checkSubscription(req, res, next) {
  try {
    const cafe = await Cafe.findById(req.cafeId).lean();
    if (!cafe) throw new AppError("Café not found", 404, "CAFE_NOT_FOUND");

    const status = getEffectiveStatus(cafe);
    if (status === "expired") {
      throw new AppError(
        "Your subscription has expired. Renew your plan to continue managing your café.",
        402,
        "SUBSCRIPTION_EXPIRED",
      );
    }
    if (status === "grace") res.set("X-Subscription-Status", "grace");

    req.cafe = cafe;
    req.subscriptionStatus = status;
    next();
  } catch (err) {
    next(err);
  }
}
