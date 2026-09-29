import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canTransition,
  getElapsedMs,
  getFinalPausedMs,
} from "../src/modules/sessions/session.logic.js";

const MIN = 60000;
const T0 = Date.UTC(2026, 9, 5, 10, 0, 0);
const at = (minutes) => new Date(T0 + minutes * MIN);

const session = (o = {}) => ({
  status: "running",
  startTime: at(0),
  endTime: null,
  pausedAt: null,
  pausedMs: 0,
  ...o,
});

test("allowed state transitions", () => {
  assert.equal(canTransition("running", "paused"), true);
  assert.equal(canTransition("running", "ended"), true);
  assert.equal(canTransition("paused", "running"), true);
  assert.equal(canTransition("paused", "ended"), true);
});

test("forbidden state transitions", () => {
  assert.equal(canTransition("running", "running"), false);
  assert.equal(canTransition("paused", "paused"), false);
  assert.equal(canTransition("ended", "running"), false);
  assert.equal(canTransition("ended", "paused"), false);
  assert.equal(canTransition("ended", "ended"), false);
  assert.equal(canTransition("unknown", "ended"), false);
});

test("running session: elapsed grows with the clock", () => {
  assert.equal(getElapsedMs(session(), at(30)), 30 * MIN);
});

test("running session: earlier pauses are subtracted", () => {
  assert.equal(getElapsedMs(session({ pausedMs: 10 * MIN }), at(30)), 20 * MIN);
});

test("paused session: elapsed is frozen at the moment of the pause", () => {
  const s = session({ status: "paused", pausedAt: at(20), pausedMs: 5 * MIN });
  assert.equal(getElapsedMs(s, at(100)), 15 * MIN);
  assert.equal(getElapsedMs(s, at(500)), 15 * MIN);
});

test("ended session: elapsed uses the end time", () => {
  const s = session({ status: "ended", endTime: at(60), pausedMs: 15 * MIN });
  assert.equal(getElapsedMs(s, at(999)), 45 * MIN);
});

test("elapsed never goes negative", () => {
  assert.equal(getElapsedMs(session(), at(-5)), 0);
});

test("final paused time includes a pause still in progress", () => {
  const paused = session({
    status: "paused",
    pausedAt: at(20),
    pausedMs: 5 * MIN,
  });
  assert.equal(getFinalPausedMs(paused, at(30)), 15 * MIN);

  const running = session({ pausedMs: 5 * MIN });
  assert.equal(getFinalPausedMs(running, at(30)), 5 * MIN);
});
