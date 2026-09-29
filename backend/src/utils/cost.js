import { isWeekendIST } from "./time.js";

// Freezes the price at the moment a session starts.
// Later price changes never touch old sessions.
export function buildRateSnapshot(rule, startTime) {
  const useWeekend = isWeekendIST(startTime) && rule.weekendRatePerHour != null;
  return {
    ratePerHour: useWeekend ? rule.weekendRatePerHour : rule.ratePerHour,
    isWeekendRate: useWeekend,
    unitMinutes: rule.billingUnit,
    minCharge: rule.minCharge || 0,
  };
}

// All money values are integer paise.
export function calculateCost({ startTime, endTime, pausedMs = 0, snapshot }) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new Error("Invalid start or end time");
  }
  if (end < start) {
    throw new Error("End time is before start time");
  }

  const totalMs = end - start;
  const paused = Math.min(Math.max(pausedMs, 0), totalMs);
  const billableMs = totalMs - paused;

  const minutes = Math.ceil(billableMs / 60000); // any started minute counts
  const unit = snapshot.unitMinutes || 1;
  const billedMinutes = Math.ceil(minutes / unit) * unit; // round up to unit

  const raw = Math.round((billedMinutes * snapshot.ratePerHour) / 60);
  const amount = Math.max(raw, snapshot.minCharge || 0);

  return { billableMs, billedMinutes, amount };
}
