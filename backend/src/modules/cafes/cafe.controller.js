import { asyncHandler } from "../../utils/asyncHandler.js";
import { getEffectiveStatus } from "../../utils/subscription.js";
import { toPublicCafe } from "../auth/auth.service.js";
import { getCafe, updateCafe } from "./cafe.service.js";

const present = (cafe) => ({
  ...toPublicCafe(cafe),
  effectiveStatus: getEffectiveStatus(cafe),
});

export const getMyCafe = asyncHandler(async (req, res) => {
  const cafe = await getCafe(req.cafeId);
  res.json({ success: true, data: { cafe: present(cafe) } });
});

export const updateMyCafe = asyncHandler(async (req, res) => {
  const cafe = await updateCafe(req.cafeId, req.body);
  res.json({ success: true, data: { cafe: present(cafe) } });
});
