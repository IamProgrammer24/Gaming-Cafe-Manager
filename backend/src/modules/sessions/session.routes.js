import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { requireCafe } from "../../middleware/tenant.js";
import { checkSubscription } from "../../middleware/subscription.js";
import {
  validate,
  validateQuery,
  validateObjectId,
} from "../../middleware/validate.js";
import { startSessionSchema, listSessionsQuery } from "./session.validation.js";
import {
  start,
  pause,
  resume,
  stop,
  getOne,
  listActive,
  list,
} from "./session.controller.js";

const router = Router();

// Owner and staff can both run sessions.
router.use(protect, requireCafe, checkSubscription);

router.get("/active", listActive); // must come before '/:id'
router.get("/", validateQuery(listSessionsQuery), list);
router.post("/start", validate(startSessionSchema), start);
router.get("/:id", validateObjectId(), getOne);
router.post("/:id/pause", validateObjectId(), pause);
router.post("/:id/resume", validateObjectId(), resume);
router.post("/:id/stop", validateObjectId(), stop);

export default router;
