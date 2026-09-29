import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import { requireRole } from "../../middleware/roles.js";
import { validate, validateObjectId } from "../../middleware/validate.js";
import {
  createDeviceSchema,
  bulkDeviceSchema,
  updateDeviceSchema,
} from "./device.validation.js";
import {
  list,
  create,
  bulkCreate,
  update,
  remove,
} from "./device.controller.js";

const router = Router();

router.use(protect, requireCafe, checkSubscription);

router.get("/", list); // owner and staff
router.post("/", requireRole("owner"), validate(createDeviceSchema), create);
router.post(
  "/bulk",
  requireRole("owner"),
  validate(bulkDeviceSchema),
  bulkCreate,
);
router.patch(
  "/:id",
  requireRole("owner"),
  validateObjectId(),
  validate(updateDeviceSchema),
  update,
);
router.delete("/:id", requireRole("owner"), validateObjectId(), remove);

export default router;
