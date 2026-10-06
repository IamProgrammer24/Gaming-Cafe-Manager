import mongoose from "mongoose";
import { DEVICE_TYPES } from "../devices/device.model.js";

const rateSnapshotSchema = new mongoose.Schema(
  {
    ratePerHour: { type: Number, required: true },
    isWeekendRate: { type: Boolean, default: false },
    unitMinutes: { type: Number, required: true },
    minCharge: { type: Number, default: 0 },
    roundUp: { type: Boolean, default: false },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    // Copied from the device so history stays correct even if the device is renamed or removed
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: DEVICE_TYPES, required: true },

    customerName: { type: String, trim: true, maxlength: 60, default: "" },
    note: { type: String, trim: true, maxlength: 200, default: "" },

    status: {
      type: String,
      enum: ["running", "paused", "ended"],
      default: "running",
    },
    isOpen: { type: Boolean, default: true }, // true while running or paused

    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    pausedAt: { type: Date, default: null }, // set only while paused
    pausedMs: { type: Number, default: 0 }, // total finished pause time

    rateSnapshot: { type: rateSnapshotSchema, required: true },

    // Filled in when the session ends
    billableMs: { type: Number, default: null },
    billedMinutes: { type: Number, default: null },
    amount: { type: Number, default: null }, // paise

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    billed: { type: Boolean, default: false }, // true once its bill exists
  },
  { timestamps: true },
);

sessionSchema.index({ cafeId: 1, startTime: -1 });
sessionSchema.index({ cafeId: 1, isOpen: 1 });
sessionSchema.index({ cafeId: 1, status: 1, billed: 1 });

// The database itself refuses a second open session on the same device.
sessionSchema.index(
  { cafeId: 1, deviceId: 1 },
  { unique: true, partialFilterExpression: { isOpen: true } },
);

export const Session = mongoose.model("Session", sessionSchema);
