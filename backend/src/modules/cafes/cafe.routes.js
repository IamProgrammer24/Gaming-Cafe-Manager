import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import { requireRole } from "../../middleware/roles.js";
import { validate } from "../../middleware/validate.js";
import { updateCafeSchema } from "./cafe.validation.js";
import { getMyCafe, updateMyCafe } from "./cafe.controller.js";

const router = Router();

router.use(protect, requireCafe);

// Reading is allowed even when expired, so owners can see their status and renew.
router.get("/", getMyCafe);

router.patch(
  "/",
  requireRole("owner"),
  checkSubscription,
  validate(updateCafeSchema),
  updateMyCafe,
);

export default router;
