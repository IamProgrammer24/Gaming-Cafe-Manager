import mongoose from "mongoose";
import { DEVICE_TYPES } from "../devices/device.model.js";

export const PAYMENT_METHODS = ["cash", "upi", "other"];

const billSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    // Copied from the session so the bill stays readable forever
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: DEVICE_TYPES, required: true },
    customerName: { type: String, default: "" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    billedMinutes: { type: Number, required: true },
    amount: { type: Number, required: true, min: 0 }, // paise, frozen

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: [...PAYMENT_METHODS, null],
      default: null,
    },
    paidAt: { type: Date, default: null },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    voided: { type: Boolean, default: false },
    voidReason: { type: String, default: "" },
    voidedAt: { type: Date, default: null },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// One bill per session, enforced by the database
billSchema.index({ cafeId: 1, sessionId: 1 }, { unique: true });
billSchema.index({ cafeId: 1, endTime: -1 });
billSchema.index({ cafeId: 1, paymentStatus: 1, voided: 1 });

export const Bill = mongoose.model("Bill", billSchema);
