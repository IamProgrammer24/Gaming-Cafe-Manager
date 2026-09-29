import mongoose from "mongoose";

export const DEVICE_TYPES = ["pc", "ps5", "xbox", "other"];

const deviceSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cafe",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    type: { type: String, enum: DEVICE_TYPES, required: true },
    notes: { type: String, trim: true, maxlength: 200, default: "" },
    isActive: { type: Boolean, default: true },
    agentId: { type: String, default: null }, // reserved for the future PC client
  },
  { timestamps: true },
);

// Unique name per café, but only among active devices (deleted ones are ignored)
deviceSchema.index(
  { cafeId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export const Device = mongoose.model("Device", deviceSchema);
