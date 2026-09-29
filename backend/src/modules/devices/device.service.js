import { AppError } from "../../utils/AppError.js";
import { Device } from "./device.model.js";
import { Session } from "../sessions/session.model.js";

const DEFAULT_PREFIX = { pc: "PC", ps5: "PS5", xbox: "Xbox", other: "Device" };

// RULE: every function takes cafeId first and every query filters by it.
export const toPublicDevice = (d) => ({
  id: d._id,
  name: d.name,
  type: d.type,
  notes: d.notes,
  isActive: d.isActive,
});

export async function listDevices(cafeId, { type } = {}) {
  const filter = { cafeId, isActive: true };
  if (type) filter.type = type;
  return Device.find(filter)
    .collation({ locale: "en", numericOrdering: true })
    .sort({ type: 1, name: 1 });
}

export async function createDevice(cafeId, data) {
  return Device.create({ ...data, cafeId });
}

export async function bulkCreateDevices(
  cafeId,
  { type, count, startFrom, prefix },
) {
  const label = prefix || DEFAULT_PREFIX[type];
  const names = Array.from(
    { length: count },
    (_, i) => `${label} ${String(startFrom + i).padStart(2, "0")}`,
  );

  const existing = await Device.find({
    cafeId,
    isActive: true,
    name: { $in: names },
  }).distinct("name");
  if (existing.length) {
    throw new AppError(
      "Some device names already exist",
      409,
      "DEVICE_NAME_CONFLICT",
      existing,
    );
  }

  return Device.insertMany(names.map((name) => ({ cafeId, name, type })));
}

async function assertNoOpenSession(cafeId, deviceId, message) {
  if (await Session.exists({ cafeId, deviceId, isOpen: true })) {
    throw new AppError(message, 409, "DEVICE_IN_USE");
  }
}

export async function updateDevice(cafeId, id, data) {
  if (data.type) {
    await assertNoOpenSession(
      cafeId,
      id,
      "Stop the running session before changing the device type",
    );
  }
  const device = await Device.findOneAndUpdate(
    { _id: id, cafeId, isActive: true },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!device) throw new AppError("Device not found", 404, "DEVICE_NOT_FOUND");
  return device;
}

// Soft delete: old sessions and bills keep pointing to this device.
export async function removeDevice(cafeId, id) {
  await assertNoOpenSession(
    cafeId,
    id,
    "Stop the running session before removing this device",
  );
  const device = await Device.findOneAndUpdate(
    { _id: id, cafeId, isActive: true },
    { $set: { isActive: false } },
    { new: true },
  );
  if (!device) throw new AppError("Device not found", 404, "DEVICE_NOT_FOUND");
  return device;
}
