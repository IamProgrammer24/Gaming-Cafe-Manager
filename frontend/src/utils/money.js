export const MAX_PAISE = 1_000_000; // ₹10,000, the same limit as the server

// "60" -> 6000, "60.5" -> 6050, "" -> null (empty), "abc" or "60.555" -> NaN (invalid)
export function rupeesToPaise(value) {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return NaN;
  return Math.round(parseFloat(s) * 100);
}

// 6000 -> "60", 6050 -> "60.50", null -> ""
export function paiseToInput(paise) {
  if (paise === null || paise === undefined) return "";
  return (paise / 100).toFixed(2).replace(/\.00$/, "");
}
