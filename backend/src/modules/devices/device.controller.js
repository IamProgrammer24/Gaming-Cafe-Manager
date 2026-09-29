import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listDevices,
  createDevice,
  bulkCreateDevices,
  updateDevice,
  removeDevice,
  toPublicDevice,
} from "./device.service.js";

export const list = asyncHandler(async (req, res) => {
  const devices = await listDevices(req.cafeId, { type: req.query.type });
  res.json({ success: true, data: { devices: devices.map(toPublicDevice) } });
});

export const create = asyncHandler(async (req, res) => {
  const device = await createDevice(req.cafeId, req.body);
  res
    .status(201)
    .json({ success: true, data: { device: toPublicDevice(device) } });
});

export const bulkCreate = asyncHandler(async (req, res) => {
  const devices = await bulkCreateDevices(req.cafeId, req.body);
  res
    .status(201)
    .json({ success: true, data: { devices: devices.map(toPublicDevice) } });
});

export const update = asyncHandler(async (req, res) => {
  const device = await updateDevice(req.cafeId, req.params.id, req.body);
  res.json({ success: true, data: { device: toPublicDevice(device) } });
});

export const remove = asyncHandler(async (req, res) => {
  await removeDevice(req.cafeId, req.params.id);
  res.json({ success: true, data: { message: "Device removed" } });
});
