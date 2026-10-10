import { isWeekendIST } from "./date.js";

// The player counts a café has a price for, with the hourly rate that applies right now.
export function playerOptions(rule, now = new Date()) {
  if (!rule) return [];
  const weekend = isWeekendIST(now);
  const pick = (rate, weekendRate) =>
    weekend && weekendRate != null ? weekendRate : rate;

  return [
    {
      players: 1,
      ratePerHour: pick(rule.ratePerHour, rule.weekendRatePerHour),
    },
    ...(rule.groupRates ?? []).map((g) => ({
      players: g.players,
      ratePerHour: pick(g.ratePerHour, g.weekendRatePerHour),
    })),
  ].sort((a, b) => a.players - b.players);
}
