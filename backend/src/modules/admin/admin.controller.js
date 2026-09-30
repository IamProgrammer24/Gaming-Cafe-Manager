import { asyncHandler } from "../../utils/asyncHandler.js";
import { getEffectiveStatus } from "../../utils/subscription.js";
import { getOverview, updateSubscription } from "./admin.service.js";

export const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getOverview() });
});

export const setSubscription = asyncHandler(async (req, res) => {
  const cafe = await updateSubscription(req.params.id, req.body);

  // Simple audit trail in the server log
  console.log(
    `[admin] ${req.user.email} changed subscription of ${cafe._id}:`,
    JSON.stringify(req.body),
  );

  res.json({
    success: true,
    data: {
      cafe: {
        id: cafe._id,
        name: cafe.name,
        plan: cafe.plan,
        status: cafe.status,
        effectiveStatus: getEffectiveStatus(cafe),
        expiresAt: cafe.expiresAt,
      },
    },
  });
});
