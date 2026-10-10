import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCost,
  buildRateSnapshot,
  roundUpToStep,
  ratesForPlayers,
} from "../src/utils/cost.js";
import { isWeekendIST } from "../src/utils/time.js";

const T0 = Date.UTC(2026, 9, 5, 10, 0, 0); // Monday 5 Oct 2026, 15:30 IST

const snap = (o = {}) => ({
  ratePerHour: 6000,
  isWeekendRate: false,
  unitMinutes: 1,
  minCharge: 0,
  ...o,
});

const run = (minutes, snapshot, pausedMin = 0, extraSec = 0) =>
  calculateCost({
    startTime: new Date(T0),
    endTime: new Date(T0 + minutes * 60000 + extraSec * 1000),
    pausedMs: pausedMin * 60000,
    snapshot,
  });

test("basic durations at Rs 60/hour", () => {
  assert.equal(run(60, snap()).amount, 6000);
  assert.equal(run(30, snap()).amount, 3000);
  assert.equal(run(90, snap()).amount, 9000);
  assert.equal(run(1, snap()).amount, 100);
});

test("a started minute counts as a full minute", () => {
  assert.equal(run(1, snap(), 0, 1).amount, 200); // 61 seconds -> 2 minutes
  assert.equal(run(1, snap()).amount, 100); // exactly 60 seconds -> 1 minute
});

test("rounds up to the 15-minute unit", () => {
  const s = snap({ unitMinutes: 15 });
  assert.equal(run(10, s).amount, 1500);
  assert.equal(run(15, s).amount, 1500);
  assert.equal(run(16, s).amount, 3000);
});

test("rounds up to the 30-minute unit", () => {
  assert.equal(run(31, snap({ unitMinutes: 30 })).amount, 6000);
});

test("minimum charge acts as a floor", () => {
  assert.equal(run(5, snap({ minCharge: 1000 })).amount, 1000);
  assert.equal(run(20, snap({ minCharge: 1000 })).amount, 2000);
  assert.equal(run(0, snap({ minCharge: 1000 })).amount, 1000);
});

test("paused time is not billed", () => {
  assert.equal(run(60, snap(), 20).amount, 4000);
  assert.equal(run(10, snap(), 50).amount, 0); // pause longer than session
});

test("zero duration costs nothing without a minimum charge", () => {
  assert.equal(run(0, snap()).amount, 0);
});

test("paise are rounded to whole numbers", () => {
  assert.equal(run(7, snap({ ratePerHour: 10000 })).amount, 1167); // 1166.67
  assert.equal(run(1, snap({ ratePerHour: 5000 })).amount, 83); // 83.33
  assert.equal(run(7, snap({ ratePerHour: 5000 })).amount, 583); // 583.33
});

test("rejects invalid times", () => {
  assert.throws(() => run(-5, snap()), /before start/);
  assert.throws(
    () =>
      calculateCost({
        startTime: "nope",
        endTime: new Date(),
        snapshot: snap(),
      }),
    /Invalid/,
  );
});

test("weekend detection uses IST, not UTC", () => {
  assert.equal(isWeekendIST(new Date("2026-10-02T12:00:00Z")), false); // Fri 17:30 IST
  assert.equal(isWeekendIST(new Date("2026-10-02T18:29:00Z")), false); // Fri 23:59 IST
  assert.equal(isWeekendIST(new Date("2026-10-02T18:30:00Z")), true); // Sat 00:00 IST
  assert.equal(isWeekendIST(new Date("2026-10-03T12:00:00Z")), true); // Sat
  assert.equal(isWeekendIST(new Date("2026-10-04T18:29:00Z")), true); // Sun 23:59 IST
  assert.equal(isWeekendIST(new Date("2026-10-04T18:30:00Z")), false); // Mon 00:00 IST
});

test("rate snapshot picks weekday or weekend rate", () => {
  const rule = {
    ratePerHour: 6000,
    weekendRatePerHour: 8000,
    billingUnit: 15,
    minCharge: 500,
  };

  const weekday = buildRateSnapshot(rule, new Date("2026-10-05T10:00:00Z"));
  assert.deepEqual(weekday, {
    ratePerHour: 6000,
    isWeekendRate: false,
    unitMinutes: 15,
    minCharge: 500,
    roundUp: false,
  });

  const weekend = buildRateSnapshot(rule, new Date("2026-10-03T10:00:00Z"));
  assert.equal(weekend.ratePerHour, 8000);
  assert.equal(weekend.isWeekendRate, true);
});

test("weekend rate falls back to normal rate when not set", () => {
  const rule = {
    ratePerHour: 6000,
    weekendRatePerHour: null,
    billingUnit: 1,
    minCharge: 0,
  };
  const s = buildRateSnapshot(rule, new Date("2026-10-03T10:00:00Z"));
  assert.equal(s.ratePerHour, 6000);
  assert.equal(s.isWeekendRate, false);
});

test("roundUpToStep rounds up to the next Rs 5", () => {
  assert.equal(roundUpToStep(0), 0);
  assert.equal(roundUpToStep(1), 500);
  assert.equal(roundUpToStep(410), 500); // Rs 4.10 -> Rs 5
  assert.equal(roundUpToStep(500), 500); // exact multiple stays
  assert.equal(roundUpToStep(501), 1000);
  assert.equal(roundUpToStep(607), 1000); // Rs 6.07 -> Rs 10
  assert.equal(roundUpToStep(1000), 1000);
  assert.equal(roundUpToStep(1167), 1500); // Rs 11.67 -> Rs 15
});

test("round-up on: bills go up to the next Rs 5", () => {
  const on = snap({ roundUp: true });
  assert.equal(run(1, on).amount, 500); // Rs 1 -> Rs 5
  assert.equal(run(5, on).amount, 500); // exactly Rs 5 stays
  assert.equal(run(6, on).amount, 1000); // Rs 6 -> Rs 10
  assert.equal(run(1, snap({ roundUp: true, ratePerHour: 24600 })).amount, 500); // Rs 4.10 -> 5
  assert.equal(
    run(1, snap({ roundUp: true, ratePerHour: 36420 })).amount,
    1000,
  ); // Rs 6.07 -> 10
});

test("round-up off or missing: nothing changes", () => {
  assert.equal(run(1, snap({ roundUp: false })).amount, 100);
  assert.equal(run(1, snap()).amount, 100); // snapshots from before this feature
});

test("round-up works with the billing unit, paused time and minimum charge", () => {
  assert.equal(
    run(15, snap({ roundUp: true, ratePerHour: 5000, unitMinutes: 15 })).amount,
    1500,
  ); // 12.50 -> 15
  assert.equal(run(60, snap({ roundUp: true }), 20).amount, 4000); // 40 min = Rs 40, stays
  assert.equal(run(5, snap({ roundUp: true, minCharge: 1200 })).amount, 1500); // min 12 -> 15
});

test("the snapshot copies the café-wide round-up setting", () => {
  const rule = {
    ratePerHour: 6000,
    weekendRatePerHour: null,
    billingUnit: 1,
    minCharge: 0,
  };
  const monday = new Date("2026-10-05T10:00:00Z");
  assert.equal(
    buildRateSnapshot(rule, monday, { roundUp: true }).roundUp,
    true,
  );
  assert.equal(
    buildRateSnapshot(rule, monday, { roundUp: false }).roundUp,
    false,
  );
  assert.equal(buildRateSnapshot(rule, monday).roundUp, false); // no setting given
});

const MULTI = {
  ratePerHour: 10000,
  weekendRatePerHour: 12000,
  billingUnit: 1,
  minCharge: 0,
  groupRates: [
    { players: 2, ratePerHour: 15000, weekendRatePerHour: null },
    { players: 3, ratePerHour: 20000, weekendRatePerHour: 24000 },
  ],
};
const MON = new Date("2026-10-05T10:00:00Z");
const SAT = new Date("2026-10-03T10:00:00Z");

test("ratesForPlayers: 1 player uses the main rate, groups use their own row", () => {
  assert.deepEqual(ratesForPlayers(MULTI, 1), {
    ratePerHour: 10000,
    weekendRatePerHour: 12000,
  });
  assert.deepEqual(ratesForPlayers(MULTI), {
    ratePerHour: 10000,
    weekendRatePerHour: 12000,
  });
  assert.deepEqual(ratesForPlayers(MULTI, 2), {
    ratePerHour: 15000,
    weekendRatePerHour: null,
  });
  assert.deepEqual(ratesForPlayers(MULTI, 3), {
    ratePerHour: 20000,
    weekendRatePerHour: 24000,
  });
  assert.equal(ratesForPlayers(MULTI, 4), null); // not priced
});

test("rules saved before this feature have no group rows", () => {
  const old = {
    ratePerHour: 6000,
    weekendRatePerHour: null,
    billingUnit: 1,
    minCharge: 0,
  };
  assert.deepEqual(ratesForPlayers(old, 1), {
    ratePerHour: 6000,
    weekendRatePerHour: null,
  });
  assert.equal(ratesForPlayers(old, 2), null);
});

test("the snapshot picks the rate for the group size", () => {
  assert.equal(buildRateSnapshot(MULTI, MON).ratePerHour, 10000);
  assert.equal(
    buildRateSnapshot(MULTI, MON, { players: 2 }).ratePerHour,
    15000,
  );
  assert.equal(
    buildRateSnapshot(MULTI, MON, { players: 3 }).ratePerHour,
    20000,
  );
});

test("weekend rate per group size, falling back to the weekday rate", () => {
  assert.equal(
    buildRateSnapshot(MULTI, SAT, { players: 1 }).ratePerHour,
    12000,
  );
  assert.equal(
    buildRateSnapshot(MULTI, SAT, { players: 2 }).ratePerHour,
    15000,
  ); // no weekend rate
  assert.equal(
    buildRateSnapshot(MULTI, SAT, { players: 2 }).isWeekendRate,
    false,
  );
  assert.equal(
    buildRateSnapshot(MULTI, SAT, { players: 3 }).ratePerHour,
    24000,
  );
  assert.equal(
    buildRateSnapshot(MULTI, SAT, { players: 3 }).isWeekendRate,
    true,
  );
});

test("a group size with no price is refused", () => {
  assert.throws(
    () => buildRateSnapshot(MULTI, MON, { players: 4 }),
    /No price set/,
  );
});

test("a group session is billed at its own rate", () => {
  const snapshot = buildRateSnapshot(MULTI, MON, { players: 2 });
  const end = new Date(MON.getTime() + 45 * 60000);
  assert.equal(
    calculateCost({ startTime: MON, endTime: end, snapshot }).amount,
    11250,
  ); // Rs 112.50
  assert.equal(
    calculateCost({
      startTime: MON,
      endTime: end,
      snapshot: { ...snapshot, roundUp: true },
    }).amount,
    11500, // round-up on: Rs 115
  );
});
