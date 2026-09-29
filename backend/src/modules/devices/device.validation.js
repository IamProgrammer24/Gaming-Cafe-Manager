import { z } from "zod";
import { DEVICE_TYPES } from "./device.model.js";

const type = z.enum(DEVICE_TYPES);

export const createDeviceSchema = z.object({
  name: z.string().trim().min(1).max(40),
  type,
  notes: z.string().trim().max(200).optional(),
});

export const bulkDeviceSchema = z.object({
  type,
  count: z.number().int().min(1).max(100),
  startFrom: z.number().int().min(1).max(999).default(1),
  prefix: z.string().trim().min(1).max(20).optional(),
});

export const updateDeviceSchema = z
  .object({
    name: z.string().trim().min(1).max(40).optional(),
    type: type.optional(),
    notes: z.string().trim().max(200).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "Send at least one field to update",
  });
