import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildRateSnapshot, calculateCost } from "../../utils/cost.js";
import { formatPaise } from "../../utils/money.js";
import {
  listPricing,
  setPricing,
  getRuleForDeviceType,
  toPublicRule,
} from "./pricing.service.js";

export const list = asyncHandler(async (req, res) => {
  const rules = await listPricing(req.cafeId);
  res.json({ success: true, data: { rules: rules.map(toPublicRule) } });
});

export const set = asyncHandler(async (req, res) => {
  const rule = await setPricing(req.cafeId, req.params.deviceType, req.body);
  res.json({ success: true, data: { rule: toPublicRule(rule) } });
});

// "What would 75 minutes cost?" Same calculator that sessions will use.
export const estimate = asyncHandler(async (req, res) => {
  const { deviceType, minutes, startTime } = req.body;
  const rule = await getRuleForDeviceType(req.cafeId, deviceType);

  const start = startTime ? new Date(startTime) : new Date();
  const end = new Date(start.getTime() + minutes * 60000);
  const snapshot = buildRateSnapshot(rule, start);
  const cost = calculateCost({ startTime: start, endTime: end, snapshot });

  res.json({
    success: true,
    data: { snapshot, ...cost, formattedAmount: formatPaise(cost.amount) },
  });
});
