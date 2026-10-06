import { AppError } from "../../utils/AppError.js";
import { getEffectiveStatus } from "../../utils/subscription.js";
import { istDateString, istDayStart } from "../../utils/time.js";
import { User } from "../auth/user.model.js";
import { Bill } from "../bills/bill.model.js";
import { Cafe } from "../cafes/cafe.model.js";
import { Device } from "../devices/device.model.js";
import { Session } from "../sessions/session.model.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Business-level numbers only. No customer details are read here.
// Fine for Beta (tens of cafés). Add pagination when you have hundreds.
export async function getOverview() {
  const now = new Date();
  const today = istDateString(now);
  const monthStart = istDayStart(`${today.slice(0, 8)}01`);

  const [
    cafes,
    owners,
    deviceCounts,
    sessionStats,
    revenue,
    sessionsToday,
    openSessions,
  ] = await Promise.all([
    Cafe.find().sort({ createdAt: -1 }).limit(500).lean(),
    User.find({ role: "owner" }).select("name email phone cafeId").lean(),
    Device.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$cafeId", count: { $sum: 1 } } },
    ]),
    Session.aggregate([
      {
        $group: {
          _id: "$cafeId",
          total: { $sum: 1 },
          thisMonth: {
            $sum: { $cond: [{ $gte: ["$startTime", monthStart] }, 1, 0] },
          },
          lastActive: { $max: "$startTime" },
        },
      },
    ]),
    Bill.aggregate([
      { $match: { voided: false } },
      { $group: { _id: "$cafeId", revenue: { $sum: "$amount" } } },
    ]),
    Session.countDocuments({ startTime: { $gte: istDayStart(today) } }),

    // Sessions open right now, split into running and paused, per café
    Session.aggregate([
      { $match: { isOpen: true } },
      {
        $group: {
          _id: "$cafeId",
          running: { $sum: { $cond: [{ $eq: ["$status", "running"] }, 1, 0] } },
          paused: { $sum: { $cond: [{ $eq: ["$status", "paused"] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const key = (id) => String(id);
  const ownerBy = new Map(owners.map((o) => [key(o.cafeId), o]));
  const devicesBy = new Map(deviceCounts.map((d) => [key(d._id), d.count]));
  const sessionsBy = new Map(sessionStats.map((s) => [key(s._id), s]));
  const revenueBy = new Map(revenue.map((r) => [key(r._id), r.revenue]));
  const openBy = new Map(openSessions.map((o) => [key(o._id), o]));

  const rows = cafes.map((c) => {
    const id = key(c._id);
    const owner = ownerBy.get(id);
    const s = sessionsBy.get(id);
    const open = openBy.get(id);
    return {
      id,
      name: c.name,
      address: c.address || "",
      phone: c.phone || "",
      runningNow: open?.running ?? 0,
      pausedNow: open?.paused ?? 0,
      owner: owner
        ? { name: owner.name, email: owner.email, phone: owner.phone }
        : null,
      createdAt: c.createdAt,
      accountAgeDays: Math.floor((now - c.createdAt) / DAY_MS),
      plan: c.plan,
      status: c.status,
      effectiveStatus: getEffectiveStatus(c, now),
      expiresAt: c.expiresAt,
      daysLeft: Math.ceil((new Date(c.expiresAt) - now) / DAY_MS),
      devices: devicesBy.get(id) ?? 0,
      sessionsTotal: s?.total ?? 0,
      sessionsThisMonth: s?.thisMonth ?? 0,
      lastActive: s?.lastActive ?? null,
      revenueProcessed: revenueBy.get(id) ?? 0, // paise
    };
  });

  const count = (st) => rows.filter((r) => r.effectiveStatus === st).length;
  const weekAgo = now.getTime() - 7 * DAY_MS;

  return {
    summary: {
      totalCafes: rows.length,
      trial: count("trial"),
      active: count("active"),
      grace: count("grace"),
      expired: count("expired"),
      payingCafes: count("active") + count("grace"), // cafés you have extended by hand
      newThisMonth: rows.filter((r) => new Date(r.createdAt) >= monthStart)
        .length,
      activeLast7Days: rows.filter(
        (r) => r.lastActive && new Date(r.lastActive).getTime() >= weekAgo,
      ).length,
      totalDevices: rows.reduce((a, r) => a + r.devices, 0),
      sessionsToday,
      runningNow: rows.reduce((a, r) => a + r.runningNow, 0),
      sessionsThisMonth: rows.reduce((a, r) => a + r.sessionsThisMonth, 0),
    },
    cafes: rows,
  };
}

export async function updateSubscription(
  cafeId,
  { extendDays, expiresAt, status, plan },
) {
  const cafe = await Cafe.findById(cafeId);
  if (!cafe) throw new AppError("Café not found", 404, "CAFE_NOT_FOUND");

  const update = {};
  if (extendDays) {
    // Extends from the current expiry if it is still in the future, otherwise from today.
    const base = Math.max(Date.now(), new Date(cafe.expiresAt).getTime());
    update.expiresAt = new Date(base + extendDays * DAY_MS);
    update.status = status ?? "active";
    update.plan = plan ?? (cafe.plan === "trial" ? "monthly" : cafe.plan);
  } else {
    if (expiresAt) update.expiresAt = expiresAt;
    if (status) update.status = status;
    if (plan) update.plan = plan;
  }

  return Cafe.findByIdAndUpdate(
    cafeId,
    { $set: update },
    { new: true, runValidators: true },
  );
}
