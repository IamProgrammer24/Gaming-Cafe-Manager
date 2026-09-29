import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import { requireRole } from "../../middleware/roles.js";
import {
  validate,
  validateQuery,
  validateObjectId,
} from "../../middleware/validate.js";
import { paySchema, voidSchema, listBillsQuery } from "./bill.validation.js";
import { list, getOne, pay, voidIt } from "./bill.controller.js";

const router = Router();

router.use(protect, requireCafe, checkSubscription);

router.get("/", validateQuery(listBillsQuery), list);
router.get("/:id", validateObjectId(), getOne);
router.post("/:id/pay", validateObjectId(), validate(paySchema), pay); // owner and staff
router.post(
  "/:id/void",
  validateObjectId(),
  requireRole("owner"),
  validate(voidSchema),
  voidIt,
);

export default router;
