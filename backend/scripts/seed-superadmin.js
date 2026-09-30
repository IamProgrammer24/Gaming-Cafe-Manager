import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/modules/auth/user.model.js";

const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";

async function run() {
  if (!email || !password) {
    throw new Error(
      "Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env first",
    );
  }
  if (password.length < 12) {
    throw new Error("SUPERADMIN_PASSWORD must be at least 12 characters");
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(
      existing.role === "superadmin"
        ? "Super admin already exists. Nothing changed."
        : `An account with ${email} already exists with role "${existing.role}". Use a different email.`,
    );
    return;
  }

  await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "superadmin",
    cafeId: null,
  });
  console.log(`Super admin created: ${email}`);
  console.log("Now delete SUPERADMIN_PASSWORD from your .env file.");
}

run()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
