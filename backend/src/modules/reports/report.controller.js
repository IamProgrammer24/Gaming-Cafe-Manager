import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  resolveRange,
  dailyDefaultStart,
  monthDefaultStart,
  getDashboard,
  getDaily,
  getMonthly,
  getBreakdown,
  exportBillsCsv,
} from "./report.service.js";

const ok = (res, data) => res.json({ success: true, data });

export const dashboard = asyncHandler(async (req, res) =>
  ok(res, await getDashboard(req.cafeId)),
);

export const daily = asyncHandler(async (req, res) => {
  const range = resolveRange(req.validatedQuery, {
    maxDays: 92,
    defaultStart: dailyDefaultStart,
  });
  ok(res, await getDaily(req.cafeId, range));
});

export const monthly = asyncHandler(async (req, res) =>
  ok(res, await getMonthly(req.cafeId, req.validatedQuery.year)),
);

export const breakdown = asyncHandler(async (req, res) => {
  const range = resolveRange(req.validatedQuery, {
    maxDays: 366,
    defaultStart: monthDefaultStart,
  });
  ok(res, await getBreakdown(req.cafeId, range));
});

export const exportCsv = asyncHandler(async (req, res) => {
  const range = resolveRange(req.validatedQuery, {
    maxDays: 366,
    defaultStart: monthDefaultStart,
  });
  const { csv, from, to } = await exportBillsCsv(req.cafeId, range);
  res.set({
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="bills_${from}_to_${to}.csv"`,
  });
  res.send(csv);
});
