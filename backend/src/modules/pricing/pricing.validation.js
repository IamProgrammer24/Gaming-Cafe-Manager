import { z } from "zod";
import { DEVICE_TYPES } from "../devices/device.model.js";

const paise = z.number().int().min(0).max(1_000_000);

const groupRate = z.object({
  players: z.number().int().min(2).max(4),
  ratePerHour: paise,
  weekendRatePerHour: paise.nullable().default(null),
});

// PUT replaces the whole rule, so missing optional fields fall back to defaults.
export const pricingSchema = z.object({
  ratePerHour: paise,
  weekendRatePerHour: paise.nullable().default(null),
  billingUnit: z.union([z.literal(1), z.literal(15), z.literal(30)]).default(1),
  minCharge: paise.default(0),
  // Optional on purpose: a save from an old browser tab (without this field) leaves the rows alone.
  // An empty list clears them.
  groupRates: z
    .array(groupRate)
    .max(3)
    .refine(
      (rows) => new Set(rows.map((r) => r.players)).size === rows.length,
      "Each player count can appear only once",
    )
    .transform((rows) => [...rows].sort((a, b) => a.players - b.players))
    .optional(),
});

export const estimateSchema = z.object({
  deviceType: z.enum(DEVICE_TYPES),
  minutes: z.number().int().min(0).max(1440),
  playerCount: z.number().int().min(1).max(4).default(1),
  startTime: z.string().datetime().optional(),
  players: z.number().int().min(1).max(4).default(1),
});
