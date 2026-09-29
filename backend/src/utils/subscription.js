import { env } from "../config/env.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Works out the real status from the stored fields.
// You can still force a lock by hand by setting status to "expired".
export function getEffectiveStatus(cafe, now = new Date()) {
  if (cafe.status === "expired") return "expired";

  const expires = new Date(cafe.expiresAt).getTime();
  const t = now.getTime();

  if (t <= expires) return cafe.status === "trial" ? "trial" : "active";
  if (t <= expires + env.graceDays * DAY_MS) return "grace";
  return "expired";
}
