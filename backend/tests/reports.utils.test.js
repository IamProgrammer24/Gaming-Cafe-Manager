import { test } from "node:test";
import assert from "node:assert/strict";
import {
  istDateString,
  istDayStart,
  addDaysYmd,
  daysBetweenYmd,
  isValidYmd,
  formatIST,
} from "../src/utils/time.js";
import { csvCell, toCsv } from "../src/utils/csv.js";

test("IST date string handles the midnight boundary", () => {
  assert.equal(istDateString(new Date("2026-10-02T18:29:00Z")), "2026-10-02"); // 23:59 IST
  assert.equal(istDateString(new Date("2026-10-02T18:30:00Z")), "2026-10-03"); // 00:00 IST
});

test("IST day starts at 18:30 UTC the previous evening", () => {
  assert.equal(
    istDayStart("2026-10-03").toISOString(),
    "2026-10-02T18:30:00.000Z",
  );
});

test("adding days crosses month and year ends", () => {
  assert.equal(addDaysYmd("2026-10-31", 1), "2026-11-01");
  assert.equal(addDaysYmd("2026-12-31", 1), "2027-01-01");
  assert.equal(addDaysYmd("2026-03-01", -1), "2026-02-28");
});

test("days between dates", () => {
  assert.equal(daysBetweenYmd("2026-09-20", "2026-09-29"), 9);
  assert.equal(daysBetweenYmd("2026-09-29", "2026-09-29"), 0);
});

test("date validation rejects impossible dates", () => {
  assert.equal(isValidYmd("2026-02-28"), true);
  assert.equal(isValidYmd("2026-02-30"), false);
  assert.equal(isValidYmd("2026-13-01"), false);
  assert.equal(isValidYmd("2026-2-8"), false);
  assert.equal(isValidYmd("yesterday"), false);
});

test("IST display format", () => {
  assert.equal(formatIST(new Date("2026-10-02T18:30:00Z")), "2026-10-03 00:00");
});

test("csv escaping", () => {
  assert.equal(csvCell(null), "");
  assert.equal(csvCell("plain"), "plain");
  assert.equal(csvCell("a,b"), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell("two\nlines"), '"two\nlines"');
});

test("csv blocks spreadsheet formula injection", () => {
  assert.equal(csvCell("=SUM(A1)"), "'=SUM(A1)");
  assert.equal(csvCell("+91 98765"), "'+91 98765");
  assert.equal(csvCell("@cmd"), "'@cmd");
});

test("csv file starts with a BOM and ends with a newline", () => {
  const out = toCsv([
    ["a", "b"],
    ["1", "2"],
  ]);
  assert.equal(out.startsWith("\uFEFF"), true);
  assert.equal(out, "\uFEFFa,b\r\n1,2\r\n");
});
