import { isWeekendIST } from "./time.js";

export const ROUND_UP_STEP = 500; // Rs 5, in paise

// Rounds up to the next multiple of the step. Exact multiples (and zero) stay as they are.
export function roundUpToStep(amount, step = ROUND_UP_STEP) {
  const rest = amount % step;
  return rest === 0 ? amount : amount + (step - rest);
}

// Freezes the price at the moment a session starts.
// Later price changes never touch old sessions.
export function buildRateSnapshot(rule, startTime, { roundUp = false } = {}) {
  const useWeekend = isWeekendIST(startTime) && rule.weekendRatePerHour != null;
  return {
    ratePerHour: useWeekend ? rule.weekendRatePerHour : rule.ratePerHour,
    isWeekendRate: useWeekend,
    unitMinutes: rule.billingUnit,
    minCharge: rule.minCharge || 0,
    roundUp: roundUp === true,
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
  let amount = Math.max(raw, snapshot.minCharge || 0);

  // Optional: round the bill up to the next Rs 5 (after the minimum charge)
  if (snapshot.roundUp) amount = roundUpToStep(amount);

  return { billableMs, billedMinutes, amount };
}
