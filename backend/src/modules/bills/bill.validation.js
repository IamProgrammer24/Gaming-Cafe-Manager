import { z } from "zod";
import { PAYMENT_METHODS } from "./bill.model.js";

export const paySchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export const voidSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Please give a reason (at least 3 characters)")
    .max(200),
});

export const listBillsQuery = z.object({
  paymentStatus: z.enum(["unpaid", "paid"]).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  voided: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
