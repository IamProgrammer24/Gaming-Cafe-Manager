// India has no daylight saving, so a fixed offset is safe.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function isWeekendIST(date) {
  const istDay = new Date(new Date(date).getTime() + IST_OFFSET_MS).getUTCDay();
  return istDay === 0 || istDay === 6; // Sunday or Saturday
}
