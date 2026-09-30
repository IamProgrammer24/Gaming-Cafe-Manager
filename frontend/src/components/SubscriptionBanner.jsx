import { SUPPORT_CONTACT } from "../config.js";

const TONES = {
  warn: "border-paused/40 bg-paused/10 text-paused",
  info: "border-brand/40 bg-brand/10 text-brand",
};

const daysLeft = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86_400_000);

export default function SubscriptionBanner({ cafe }) {
  if (!cafe) return null;

  const status = cafe.effectiveStatus;
  const left = daysLeft(cafe.expiresAt);
  let tone;
  let message;

  if (status === "grace") {
    tone = "warn";
    message =
      "Your subscription has ended and is in a short grace period. Renew now to avoid being locked out.";
  } else if ((status === "trial" || status === "active") && left <= 3) {
    tone = "info";
    const days = `${left} day${left === 1 ? "" : "s"}`;
    message =
      status === "trial"
        ? `Your free trial ends in ${days}.`
        : `Your plan ends in ${days}.`;
  } else {
    return null;
  }

  return (
    <p
      role="status"
      className={`mb-4 rounded-lg border px-3 py-2 text-sm ${TONES[tone]}`}
    >
      {message} Contact {SUPPORT_CONTACT} to renew.
    </p>
  );
}
