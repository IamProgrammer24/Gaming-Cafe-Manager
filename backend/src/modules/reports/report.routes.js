import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import { requireRole } from "../../middleware/roles.js";
import { validateQuery } from "../../middleware/validate.js";
import { rangeQuery, yearQuery } from "./report.validation.js";
import {
  dashboard,
  daily,
  monthly,
  breakdown,
  exportCsv,
} from "./report.controller.js";

const router = Router();

// Revenue is owner-only.
router.use(protect, requireCafe, checkSubscription, requireRole("owner"));

router.get("/dashboard", dashboard);
router.get("/daily", validateQuery(rangeQuery), daily);
router.get("/monthly", validateQuery(yearQuery), monthly);
router.get("/breakdown", validateQuery(rangeQuery), breakdown);
router.get("/export.csv", validateQuery(rangeQuery), exportCsv);

export default router;
