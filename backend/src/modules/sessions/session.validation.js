import { z } from "zod";
import { PAYMENT_METHODS } from "../bills/bill.model.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const startSessionSchema = z.object({
  deviceId: objectId,
  customerName: z.string().trim().max(60).optional(),
  note: z.string().trim().max(200).optional(),
  players: z.number().int().min(1).max(4).default(1),
});

export const listSessionsQuery = z.object({
  status: z.enum(["running", "paused", "ended"]).optional(),
  deviceId: objectId.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Optional: staff can take payment in the same tap that stops the session.
export const stopSessionSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});
