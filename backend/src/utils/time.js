// India has no daylight saving, so a fixed offset is safe.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isWeekendIST(date) {
  const istDay = new Date(new Date(date).getTime() + IST_OFFSET_MS).getUTCDay();
  return istDay === 0 || istDay === 6; // Sunday or Saturday
}

// "2026-10-03" for the IST calendar day of the given moment.
export function istDateString(date = new Date()) {
  return new Date(new Date(date).getTime() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

// True only for real calendar dates in YYYY-MM-DD format.
export function isValidYmd(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDaysYmd(ymd, n) {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) + n * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function daysBetweenYmd(a, b) {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS,
  );
}

// The exact moment (UTC) when the given IST day begins.
export function istDayStart(ymd) {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) - IST_OFFSET_MS);
}

// "2026-10-03 00:00" in IST, used in exports.
export function formatIST(date) {
  return new Date(new Date(date).getTime() + IST_OFFSET_MS)
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");
}
