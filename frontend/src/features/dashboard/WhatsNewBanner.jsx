import { useState } from "react";
import { Link } from "react-router-dom";

const UPDATE_ID = "multiplayer-pricing-and-bill-roundup-v1";

export default function WhatsNewBanner({ userId }) {
  const storageKey = `gcm:update:${userId}:${UPDATE_ID}`;

  const [visible, setVisible] = useState(() => {
    if (!userId) return false;

    try {
      return localStorage.getItem(storageKey) !== "dismissed";
    } catch {
      return true;
    }
  });

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch {
      // Continue even if browser storage is unavailable.
    }

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section
      aria-label="What's new"
      className="relative overflow-hidden rounded-xl border border-line bg-surface px-4 py-3 shadow-sm"
    >
      <div
        className="absolute inset-y-0 left-0 w-1 bg-brand"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="shrink-0 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">
          ✦ New Features
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">
            <span className="text-brand">Multiplayer Pricing</span>
            {" & "}
            <span className="text-brand">Bill Round-Up</span>
            {" are live!"}
          </p>

          <p className="text-xs text-muted">
            Custom rates for 1–4 players and automatic bill rounding to the next
            ₹5.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/setup?tab=pricing"
            className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-fg hover:opacity-90"
          >
            Player Prices ↗
          </Link>

          <Link
            to="/setup?tab=cafe"
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-fg hover:bg-surface-alt"
          >
            Bill Settings ↗
          </Link>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="rounded-md p-2 text-muted hover:text-fg"
          >
            ✕
          </button>
        </div>
      </div>
    </section>
  );
}
