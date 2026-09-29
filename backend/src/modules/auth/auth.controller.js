import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  registerOwner,
  loginUser,
  refreshAccess,
  getCafeById,
  signAccessToken,
  signRefreshToken,
  toPublicUser,
  toPublicCafe,
} from "./auth.service.js";

const REFRESH_COOKIE = "refreshToken";
const isProd = env.nodeEnv === "production";

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/api/v1/auth",
};

const setRefreshCookie = (res, user) =>
  res.cookie(REFRESH_COOKIE, signRefreshToken(user), {
    ...baseCookie,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const register = asyncHandler(async (req, res) => {
  const { user, cafe } = await registerOwner(req.body);
  setRefreshCookie(res, user);
  res.status(201).json({
    success: true,
    data: {
      user: toPublicUser(user),
      cafe: toPublicCafe(cafe),
      accessToken: signAccessToken(user),
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { user, cafe } = await loginUser(req.body);
  setRefreshCookie(res, user);
  res.json({
    success: true,
    data: {
      user: toPublicUser(user),
      cafe: toPublicCafe(cafe),
      accessToken: signAccessToken(user),
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const accessToken = await refreshAccess(req.cookies[REFRESH_COOKIE]);
  res.json({ success: true, data: { accessToken } });
});

export const logout = (req, res) => {
  res.clearCookie(REFRESH_COOKIE, baseCookie);
  res.json({ success: true, data: { message: "Logged out" } });
};

export const me = asyncHandler(async (req, res) => {
  const cafe = await getCafeById(req.user.cafeId);
  res.json({
    success: true,
    data: { user: req.user, cafe: toPublicCafe(cafe) },
  });
});
