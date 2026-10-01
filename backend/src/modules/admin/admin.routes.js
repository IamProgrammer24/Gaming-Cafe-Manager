import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { validate, validateObjectId } from "../../middleware/validate.js";
import { subscriptionSchema } from "./admin.validation.js";
import { overview, setSubscription } from "./admin.controller.js";

const router = Router();

// Super admin only. No requireCafe: you don't belong to any café.
router.use(protect, requireRole("superadmin"));

router.get("/cafes", overview);
router.patch(
  "/cafes/:id/subscription",
  validateObjectId(),
  validate(subscriptionSchema),
  setSubscription,
);

// Diagnostic: shows how the server sees your connection. Used once after deploying.
router.get("/network-check", (req, res) => {
  res.json({
    success: true,
    data: {
      ip: req.ip,
      xForwardedFor: req.headers["x-forwarded-for"] ?? null,
      trustProxy: req.app.get("trust proxy"),
    },
  });
});

export default router;
