import { AppError } from "../../utils/AppError.js";
import { Device } from "../devices/device.model.js";
import {
  getRuleForDeviceType,
  assertPlayersPriced,
} from "../pricing/pricing.service.js";
import { buildRateSnapshot, calculateCost } from "../../utils/cost.js";
import { Session } from "./session.model.js";
import {
  canTransition,
  getElapsedMs,
  getFinalPausedMs,
} from "./session.logic.js";
import { createBillForSession } from "../bills/bill.service.js";
import { Cafe } from "../cafes/cafe.model.js";

// RULE: every function takes cafeId first and every query filters by it.

export function toPublicSession(s, now = new Date()) {
  const open = s.status !== "ended";
  let amount = s.amount;

  if (open) {
    // Running total so far (not final until the session is stopped)
    const reference = s.status === "paused" ? s.pausedAt : now;
    amount = calculateCost({
      startTime: s.startTime,
      endTime: reference,
      pausedMs: s.pausedMs,
      snapshot: s.rateSnapshot,
    }).amount;
  }

  return {
    id: s._id,
    deviceId: s.deviceId,
    deviceName: s.deviceName,
    deviceType: s.deviceType,
    players: s.players ?? 1,
    customerName: s.customerName,
    note: s.note,
    status: s.status,
    startTime: s.startTime,
    endTime: s.endTime,
    pausedAt: s.pausedAt,
    pausedMs: s.pausedMs,
    elapsedMs: getElapsedMs(s, now),
    rateSnapshot: s.rateSnapshot,
    amount,
    isFinalAmount: !open,
    billedMinutes: s.billedMinutes,
  };
}

async function getSession(cafeId, id) {
  const session = await Session.findOne({ _id: id, cafeId });
  if (!session)
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  return session;
}

function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new AppError(
      `Cannot change a session from ${from} to ${to}`,
      409,
      "INVALID_TRANSITION",
    );
  }
}

const conflict = () =>
  new AppError(
    "This session was just changed by someone else. Refresh and try again.",
    409,
    "SESSION_CONFLICT",
  );

export async function startSession(
  cafeId,
  userId,
  { deviceId, customerName, note, players = 1 },
) {
  const device = await Device.findOne({
    _id: deviceId,
    cafeId,
    isActive: true,
  });
  if (!device) throw new AppError("Device not found", 404, "DEVICE_NOT_FOUND");

  const rule = await getRuleForDeviceType(cafeId, device.type); // 422 if no price set
  assertPlayersPriced(rule, players); // 422 if this group size has no price
  const cafe = await Cafe.findById(cafeId).select("roundUpBills").lean();
  const now = new Date();

  try {
    return await Session.create({
      cafeId,
      deviceId: device._id,
      deviceName: device.name,
      deviceType: device.type,
      players,
      customerName,
      note,
      startTime: now,
      rateSnapshot: buildRateSnapshot(rule, now, {
        roundUp: cafe?.roundUpBills === true,
        players,
      }),
      createdBy: userId,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(
        "This device already has an open session",
        409,
        "DEVICE_BUSY",
      );
    }
    throw err;
  }
}

export async function pauseSession(cafeId, id) {
  const session = await getSession(cafeId, id);
  assertTransition(session.status, "paused");

  const updated = await Session.findOneAndUpdate(
    { _id: id, cafeId, status: "running" },
    { $set: { status: "paused", pausedAt: new Date() } },
    { new: true },
  );
  if (!updated) throw conflict();
  return updated;
}

export async function resumeSession(cafeId, id) {
  const session = await getSession(cafeId, id);
  assertTransition(session.status, "running");

  const pausedMs = getFinalPausedMs(session, new Date());

  const updated = await Session.findOneAndUpdate(
    { _id: id, cafeId, status: "paused", pausedAt: session.pausedAt },
    { $set: { status: "running", pausedMs, pausedAt: null } },
    { new: true },
  );
  if (!updated) throw conflict();
  return updated;
}

export async function stopSession(cafeId, id, userId, { paymentMethod } = {}) {
  const session = await getSession(cafeId, id);
  assertTransition(session.status, "ended");

  const now = new Date();
  const pausedMs = getFinalPausedMs(session, now);
  const cost = calculateCost({
    startTime: session.startTime,
    endTime: now,
    pausedMs,
    snapshot: session.rateSnapshot,
  });

  const updated = await Session.findOneAndUpdate(
    {
      _id: id,
      cafeId,
      isOpen: true,
      status: session.status,
      pausedMs: session.pausedMs,
    },
    {
      $set: {
        status: "ended",
        isOpen: false,
        endTime: now,
        pausedAt: null,
        pausedMs,
        billableMs: cost.billableMs,
        billedMinutes: cost.billedMinutes,
        amount: cost.amount,
        endedBy: userId,
      },
    },
    { new: true },
  );
  if (!updated) throw conflict();

  // The session is already ended. If the bill fails, it is created later by the backfill.
  let bill = null;
  try {
    bill = await createBillForSession(updated, { paymentMethod, userId });
  } catch (err) {
    console.error("Bill creation failed, will be backfilled:", err);
  }

  return { session: updated, bill };
}
export const getOneSession = (cafeId, id) => getSession(cafeId, id);

export const listActiveSessions = (cafeId) =>
  Session.find({ cafeId, isOpen: true }).sort({ startTime: 1 });

export async function listSessions(
  cafeId,
  { status, deviceId, from, to, page, limit },
) {
  const filter = { cafeId };
  if (status) filter.status = status;
  if (deviceId) filter.deviceId = deviceId;
  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = from;
    if (to) filter.startTime.$lte = to;
  }

  const [items, total] = await Promise.all([
    Session.find(filter)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Session.countDocuments(filter),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
