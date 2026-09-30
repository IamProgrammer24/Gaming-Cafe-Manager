import { z } from "zod";

// "grace" is not settable: it is worked out automatically from expiresAt.
export const subscriptionSchema = z
  .object({
    extendDays: z.number().int().min(1).max(366).optional(),
    expiresAt: z.coerce.date().optional(),
    status: z.enum(["trial", "active", "expired"]).optional(),
    plan: z.string().trim().min(1).max(30).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Send at least one field",
  })
  .refine((d) => !(d.extendDays && d.expiresAt), {
    message: "Use either extendDays or expiresAt, not both",
  })
  .refine((d) => !(d.extendDays && d.status === "expired"), {
    message: "Cannot extend and expire at the same time",
  });
