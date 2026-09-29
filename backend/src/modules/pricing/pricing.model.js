import mongoose from "mongoose";
import { DEVICE_TYPES } from "../devices/device.model.js";

const wholePaise = {
  validator: (v) => v == null || Number.isInteger(v),
  message: "{PATH} must be a whole number of paise",
};

const pricingRuleSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    deviceType: { type: String, enum: DEVICE_TYPES, required: true },
    ratePerHour: { type: Number, required: true, min: 0, validate: wholePaise },
    weekendRatePerHour: {
      type: Number,
      default: null,
      min: 0,
      validate: wholePaise,
    },
    billingUnit: {
      type: Number,
      default: 1,
      validate: {
        validator: (v) => [1, 15, 30].includes(v),
        message: "billingUnit must be 1, 15 or 30",
      },
    },
    minCharge: { type: Number, default: 0, min: 0, validate: wholePaise },
  },
  { timestamps: true },
);

pricingRuleSchema.index({ cafeId: 1, deviceType: 1 }, { unique: true });

export const PricingRule = mongoose.model("PricingRule", pricingRuleSchema);
