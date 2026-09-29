import { z } from "zod";

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour) format");

export const updateCafeSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    address: z.string().trim().max(300).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{8,15}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    openingHours: z
      .object({ open: time.optional(), close: time.optional() })
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Send at least one field to update",
  });
