import { z } from "zod";
import { DEVICE_TYPES } from "../devices/device.model.js";

const paise = z.number().int().min(0).max(1_000_000);

// PUT replaces the whole rule, so missing optional fields fall back to defaults.
export const pricingSchema = z.object({
  ratePerHour: paise,
  weekendRatePerHour: paise.nullable().default(null),
  billingUnit: z.union([z.literal(1), z.literal(15), z.literal(30)]).default(1),
  minCharge: paise.default(0),
});

export const estimateSchema = z.object({
  deviceType: z.enum(DEVICE_TYPES),
  minutes: z.number().int().min(0).max(1440),
  startTime: z.string().datetime().optional(),
});
