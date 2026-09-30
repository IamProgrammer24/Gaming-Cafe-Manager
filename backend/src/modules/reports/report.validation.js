import { z } from "zod";
import { isValidYmd } from "../../utils/time.js";

const ymd = z
  .string()
  .refine(isValidYmd, "Use a real date in YYYY-MM-DD format");

export const rangeQuery = z.object({
  from: ymd.optional(),
  to: ymd.optional(),
});

export const yearQuery = z.object({
  year: z.coerce.number().int().min(2024).max(2100).optional(),
});
