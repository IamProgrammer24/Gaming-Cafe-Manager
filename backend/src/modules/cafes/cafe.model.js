import mongoose from "mongoose";

const cafeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    openingHours: {
      open: { type: String, default: "10:00" },
      close: { type: String, default: "23:00" },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["trial", "active", "grace", "expired"],
      default: "trial",
    },
    expiresAt: { type: Date, required: true },
    plan: { type: String, default: "trial" },
    roundUpBills: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Cafe = mongoose.model("Cafe", cafeSchema);
