import { Lock } from "lucide-react";
import { SUPPORT_CONTACT } from "../config.js";
import { formatDate } from "../utils/format.js";

export default function ExpiredNotice({ cafe }) {
  return (
    <section className="mx-auto mt-8 max-w-lg rounded-2xl border border-line bg-surface p-6 text-center">
      <Lock className="mx-auto size-10 text-busy" aria-hidden />
      <h1 className="mt-3 text-xl font-semibold text-fg">
        Your subscription has expired
      </h1>
      <p className="mt-2 text-sm text-muted">
        Renew your plan to continue managing {cafe.name}. Your devices, bills
        and revenue history are safe, and everything returns as soon as you
        renew.
      </p>
      <p className="mt-2 text-sm text-muted">
        Expired on {formatDate(cafe.expiresAt)}.
      </p>
      <p className="mt-4 text-sm text-fg">
        To renew, contact <strong>{SUPPORT_CONTACT}</strong>
      </p>
    </section>
  );
}
