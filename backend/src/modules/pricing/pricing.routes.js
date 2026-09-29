import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import { requireRole } from "../../middleware/roles.js";
import { validate } from "../../middleware/validate.js";
import { AppError } from "../../utils/AppError.js";
import { DEVICE_TYPES } from "../devices/device.model.js";
import { pricingSchema, estimateSchema } from "./pricing.validation.js";
import { list, set, estimate } from "./pricing.controller.js";

const validateDeviceType = (req, res, next) =>
  DEVICE_TYPES.includes(req.params.deviceType)
    ? next()
    : next(new AppError("Invalid device type", 400, "INVALID_DEVICE_TYPE"));

const router = Router();

router.use(protect, requireCafe, checkSubscription);

router.get("/", list); // owner and staff
router.post("/estimate", validate(estimateSchema), estimate);
router.put(
  "/:deviceType",
  requireRole("owner"),
  validateDeviceType,
  validate(pricingSchema),
  set,
);

export default router;
