import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCost, buildRateSnapshot } from "../src/utils/cost.js";
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
