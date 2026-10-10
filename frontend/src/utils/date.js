// All "ymd" values are IST calendar dates in YYYY-MM-DD format.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const istToday = () =>
  new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);

export const addDays = (ymd, n) =>
  new Date(Date.parse(`${ymd}T00:00:00Z`) + n * DAY_MS)
    .toISOString()
    .slice(0, 10);

export const daysBetween = (a, b) =>
  Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS,
  );

export const monthStart = (ymd) => `${ymd.slice(0, 8)}01`;

// The exact moment (UTC) an IST day starts and ends.
export const istDayStartIso = (ymd) =>
  new Date(Date.parse(`${ymd}T00:00:00Z`) - IST_OFFSET_MS).toISOString();

export const istDayEndIso = (ymd) =>
  new Date(
    Date.parse(`${addDays(ymd, 1)}T00:00:00Z`) - IST_OFFSET_MS - 1,
  ).toISOString();

export function isWeekendIST(date = new Date()) {
  const day = new Date(date.getTime() + IST_OFFSET_MS).getUTCDay();
  return day === 0 || day === 6;
}
