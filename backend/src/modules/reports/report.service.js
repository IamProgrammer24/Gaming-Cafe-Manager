import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { toCsv } from "../../utils/csv.js";
import {
  istDateString,
  istDayStart,
  addDaysYmd,
  daysBetweenYmd,
  formatIST,
} from "../../utils/time.js";
import { Bill } from "../bills/bill.model.js";
import { backfillMissingBills } from "../bills/bill.service.js";
import { Device } from "../devices/device.model.js";
import { Session } from "../sessions/session.model.js";

// RULE: every function takes cafeId first and every pipeline matches on it.
// Aggregation does NOT auto-cast ids, so we convert explicitly.
const oid = (id) => new mongoose.Types.ObjectId(id);
const TZ = "Asia/Kolkata";
const MAX_EXPORT_ROWS = 10000;
const isPaid = { $eq: ["$paymentStatus", "paid"] };

// Makes sure any ended session without a bill gets one before we add up numbers.
async function refreshBills(cafeId) {
  try {
    await backfillMissingBills(cafeId);
  } catch (err) {
    console.error("Bill backfill failed:", err);
  }
}

// Turns optional "YYYY-MM-DD" strings into exact UTC boundaries for IST days.
export function resolveRange({ from, to }, { maxDays, defaultStart }) {
  const end = to ?? istDateString();
  const start = from ?? defaultStart(end);

  if (start > end) {
    throw new AppError('"from" must not be after "to"', 400, "INVALID_RANGE");
  }
  if (daysBetweenYmd(start, end) + 1 > maxDays) {
    throw new AppError(
      `Date range is too large (maximum ${maxDays} days)`,
      400,
      "RANGE_TOO_LARGE",
    );
  }
  return {
    from: start,
    to: end,
    start: istDayStart(start),
    endExclusive: istDayStart(addDaysYmd(end, 1)),
  };
}

export const dailyDefaultStart = (end) => addDaysYmd(end, -29); // last 30 days
export const monthDefaultStart = (end) => `${end.slice(0, 8)}01`; // this month so far

async function summarize(cafeId, start, endExclusive) {
  const [r] = await Bill.aggregate([
    {
      $match: {
        cafeId: oid(cafeId),
        endTime: { $gte: start, $lt: endExclusive },
      },
    },
    {
      $facet: {
        totals: [
          { $match: { voided: false } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$amount" },
              collected: { $sum: { $cond: [isPaid, "$amount", 0] } },
              sessions: { $sum: 1 },
              billedMinutes: { $sum: "$billedMinutes" },
            },
          },
        ],
        byDeviceType: [
          { $match: { voided: false } },
          {
            $group: {
              _id: "$deviceType",
              revenue: { $sum: "$amount" },
              sessions: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
        ],
        byPaymentMethod: [
          { $match: { voided: false } },
          {
            $group: {
              _id: { $cond: [isPaid, "$paymentMethod", "unpaid"] },
              revenue: { $sum: "$amount" },
              sessions: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
        ],
        voided: [
          { $match: { voided: true } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: "$amount" },
            },
          },
        ],
      },
    },
  ]);

  const t = r.totals[0] || {
    revenue: 0,
    collected: 0,
    sessions: 0,
    billedMinutes: 0,
  };
  const v = r.voided[0] || { count: 0, amount: 0 };

  return {
    revenue: t.revenue,
    collected: t.collected,
    pending: t.revenue - t.collected,
    sessions: t.sessions,
    billedMinutes: t.billedMinutes,
    voided: { count: v.count, amount: v.amount },
    byDeviceType: r.byDeviceType.map((x) => ({
      deviceType: x._id,
      revenue: x.revenue,
      sessions: x.sessions,
    })),
    byPaymentMethod: r.byPaymentMethod.map((x) => ({
      method: x._id,
      revenue: x.revenue,
      sessions: x.sessions,
    })),
  };
}

export async function getDashboard(cafeId) {
  await refreshBills(cafeId);

  const today = istDateString();
  const start = istDayStart(today);
  const endExclusive = istDayStart(addDaysYmd(today, 1));

  const [todaySummary, totalDevices, openByStatus, outstanding] =
    await Promise.all([
      summarize(cafeId, start, endExclusive),
      Device.countDocuments({ cafeId, isActive: true }),
      Session.aggregate([
        { $match: { cafeId: oid(cafeId), isOpen: true } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Bill.aggregate([
        {
          $match: {
            cafeId: oid(cafeId),
            voided: false,
            paymentStatus: "unpaid",
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  const running = openByStatus.find((x) => x._id === "running")?.count ?? 0;
  const paused = openByStatus.find((x) => x._id === "paused")?.count ?? 0;

  return {
    date: today,
    today: todaySummary,
    devices: {
      total: totalDevices,
      running,
      paused,
      free: Math.max(totalDevices - running - paused, 0),
    },
    outstanding: {
      amount: outstanding[0]?.amount ?? 0,
      count: outstanding[0]?.count ?? 0,
    },
  };
}

export async function getDaily(cafeId, range) {
  await refreshBills(cafeId);

  const rows = await Bill.aggregate([
    {
      $match: {
        cafeId: oid(cafeId),
        voided: false,
        endTime: { $gte: range.start, $lt: range.endExclusive },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$endTime", timezone: TZ },
        },
        revenue: { $sum: "$amount" },
        collected: { $sum: { $cond: [isPaid, "$amount", 0] } },
        sessions: { $sum: 1 },
        billedMinutes: { $sum: "$billedMinutes" },
      },
    },
  ]);

  const byDate = new Map(rows.map((r) => [r._id, r]));
  const count = daysBetweenYmd(range.from, range.to) + 1;
  const days = Array.from({ length: count }, (_, i) => {
    const date = addDaysYmd(range.from, i);
    const r = byDate.get(date);
    return {
      date,
      revenue: r?.revenue ?? 0,
      collected: r?.collected ?? 0,
      sessions: r?.sessions ?? 0,
      billedMinutes: r?.billedMinutes ?? 0,
    };
  });

  const totals = days.reduce(
    (a, d) => ({
      revenue: a.revenue + d.revenue,
      collected: a.collected + d.collected,
      sessions: a.sessions + d.sessions,
    }),
    { revenue: 0, collected: 0, sessions: 0 },
  );

  return { from: range.from, to: range.to, days, totals };
}

export async function getMonthly(cafeId, year) {
  await refreshBills(cafeId);

  const y = year ?? Number(istDateString().slice(0, 4));
  const start = istDayStart(`${y}-01-01`);
  const endExclusive = istDayStart(`${y + 1}-01-01`);

  const rows = await Bill.aggregate([
    {
      $match: {
        cafeId: oid(cafeId),
        voided: false,
        endTime: { $gte: start, $lt: endExclusive },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$endTime", timezone: TZ },
        },
        revenue: { $sum: "$amount" },
        collected: { $sum: { $cond: [isPaid, "$amount", 0] } },
        sessions: { $sum: 1 },
      },
    },
  ]);

  const byMonth = new Map(rows.map((r) => [r._id, r]));
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = `${y}-${String(i + 1).padStart(2, "0")}`;
    const r = byMonth.get(month);
    return {
      month,
      revenue: r?.revenue ?? 0,
      collected: r?.collected ?? 0,
      sessions: r?.sessions ?? 0,
    };
  });

  const totals = months.reduce(
    (a, m) => ({
      revenue: a.revenue + m.revenue,
      collected: a.collected + m.collected,
      sessions: a.sessions + m.sessions,
    }),
    { revenue: 0, collected: 0, sessions: 0 },
  );

  return { year: y, months, totals };
}

export async function getBreakdown(cafeId, range) {
  await refreshBills(cafeId);
  const summary = await summarize(cafeId, range.start, range.endExclusive);
  return { from: range.from, to: range.to, ...summary };
}

const rupees = (paise) => (paise / 100).toFixed(2);

export async function exportBillsCsv(cafeId, range) {
  await refreshBills(cafeId);

  const bills = await Bill.find({
    cafeId,
    endTime: { $gte: range.start, $lt: range.endExclusive },
  })
    .sort({ endTime: 1 })
    .limit(MAX_EXPORT_ROWS + 1)
    .lean();

  if (bills.length > MAX_EXPORT_ROWS) {
    throw new AppError(
      `Too many bills to export at once (maximum ${MAX_EXPORT_ROWS}). Choose a shorter range.`,
      400,
      "EXPORT_TOO_LARGE",
    );
  }

  const rows = [
    [
      "Date (IST)",
      "Device",
      "Type",
      "Customer",
      "Start (IST)",
      "End (IST)",
      "Billed minutes",
      "Amount (INR)",
      "Payment status",
      "Payment method",
      "Voided",
      "Void reason",
      "players",
    ],
    ...bills.map((b) => [
      formatIST(b.endTime).slice(0, 10),
      b.deviceName,
      b.deviceType,
      b.customerName,
      formatIST(b.startTime),
      formatIST(b.endTime),
      b.billedMinutes,
      rupees(b.amount),
      b.paymentStatus,
      b.paymentMethod,
      b.voided ? "yes" : "no",
      b.voidReason,
      b.players ?? 1,
    ]),
  ];

  return { csv: toCsv(rows), from: range.from, to: range.to };
}
