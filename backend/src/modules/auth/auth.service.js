import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { User } from "./user.model.js";
import { Cafe } from "../cafes/cafe.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpires,
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpires,
  });

export const toPublicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  cafeId: u.cafeId,
});

export const toPublicCafe = (c) =>
  c && {
    id: c._id,
    name: c.name,
    address: c.address,
    phone: c.phone,
    openingHours: c.openingHours,
    status: c.status,
    expiresAt: c.expiresAt,
    plan: c.plan,
  };

export async function registerOwner({
  name,
  email,
  phone,
  password,
  cafeName,
}) {
  if (await User.exists({ email })) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "EMAIL_TAKEN",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = new mongoose.Types.ObjectId();

  const cafe = await Cafe.create({
    name: cafeName,
    ownerId: userId,
    status: "trial",
    plan: "trial",
    expiresAt: new Date(Date.now() + env.trialDays * DAY_MS),
  });

  let user;
  try {
    user = await User.create({
      _id: userId,
      name,
      email,
      phone,
      passwordHash,
      role: "owner",
      cafeId: cafe._id,
    });
  } catch (err) {
    await Cafe.deleteOne({ _id: cafe._id }); // don't leave an orphan café
    throw err;
  }

  return { user, cafe };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+passwordHash");
  const ok =
    user &&
    user.isActive &&
    (await bcrypt.compare(password, user.passwordHash));
  if (!ok)
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  const cafe = user.cafeId ? await Cafe.findById(user.cafeId) : null;
  return { user, cafe };
}

export async function refreshAccess(token) {
  if (!token) throw new AppError("Please log in", 401, "REFRESH_INVALID");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    throw new AppError(
      "Session expired, please log in again",
      401,
      "REFRESH_INVALID",
    );
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError(
      "Session expired, please log in again",
      401,
      "REFRESH_INVALID",
    );
  }
  return signAccessToken(user);
}

export const getCafeById = (id) => (id ? Cafe.findById(id) : null);
