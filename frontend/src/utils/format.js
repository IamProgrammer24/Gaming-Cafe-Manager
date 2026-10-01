const IST = "Asia/Kolkata";

// paise in, "₹1,250" or "₹85.50" out
export function formatPaise(paise) {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

// 3725000 -> "01:02:05"
export function formatDuration(ms) {
  const total = Math.max(Math.floor(ms / 1000), 0);
  const pad = (n) => String(n).padStart(2, "0");
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${pad(h)}:${pad(m)}:${pad(total % 60)}`;
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST,
  });

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });

// "2026-10-03" -> "3 Oct"
export const formatYmd = (ymd) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

// "2026-10" -> "Oct"
export const formatMonthShort = (ym) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-IN", {
    month: "short",
    timeZone: "UTC",
  });
