import { Gamepad2, Monitor } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { formatPaise } from "../../utils/format.js";
import LiveTimer from "./LiveTimer.jsx";

const ICONS = { pc: Monitor, ps5: Gamepad2, xbox: Gamepad2, other: Gamepad2 };

// Status is always shown as a word plus a dot, never by color alone.
const STATUS = {
  free: {
    label: "Free",
    dot: "bg-free",
    text: "text-free",
    border: "border-line",
  },
  running: {
    label: "Running",
    dot: "bg-busy",
    text: "text-busy",
    border: "border-busy/50",
  },
  paused: {
    label: "Paused",
    dot: "bg-paused",
    text: "text-paused",
    border: "border-paused/50",
  },
};

export default function DeviceCard({
  device,
  session,
  offsetMs,
  hasPrice,
  busy,
  onStart,
  onPause,
  onResume,
  onStop,
}) {
  const state = session ? session.status : "free";
  const st = STATUS[state];
  const Icon = ICONS[device.type] ?? Gamepad2;

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-surface p-3 sm:p-4 ${st.border}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-5 shrink-0 text-muted" aria-hidden />
          <h3 className="truncate font-semibold text-fg">{device.name}</h3>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${st.text}`}
        >
          <span className={`size-2 rounded-full ${st.dot}`} aria-hidden />
          {st.label}
        </span>
      </header>

      <div className="mt-3 min-h-20 flex-1">
        {session ? (
          <>
            <LiveTimer
              session={session}
              offsetMs={offsetMs}
              className={`text-2xl font-semibold tabular-nums ${state === "paused" ? "text-paused" : "text-fg"}`}
            />
            <p className="mt-1 text-sm font-medium text-money">
              {formatPaise(session.amount)}{" "}
              <span className="font-normal text-muted">so far</span>
            </p>
            {session.customerName && (
              <p className="mt-0.5 truncate text-sm text-muted">
                {session.customerName}
              </p>
            )}
            <p className="text-xs text-muted">
              {formatPaise(session.rateSnapshot.ratePerHour)}/hr
              {session.rateSnapshot.isWeekendRate ? " · weekend rate" : ""}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">
            {device.notes || "Ready for a customer"}
          </p>
        )}
      </div>

      <footer className="mt-3">
        {!session && (
          <Button
            className="w-full px-2"
            onClick={onStart}
            disabled={!hasPrice}
          >
            {hasPrice ? "Start" : "Set price first"}
          </Button>
        )}
        {session && (
          <div className="grid grid-cols-2 gap-2">
            {state === "running" ? (
              <Button
                variant="ghost"
                className="px-2"
                onClick={onPause}
                loading={busy}
              >
                Pause
              </Button>
            ) : (
              <Button className="px-2" onClick={onResume} loading={busy}>
                Resume
              </Button>
            )}
            <Button
              variant="danger"
              className="px-2"
              onClick={onStop}
              disabled={busy}
            >
              Stop
            </Button>
          </div>
        )}
      </footer>
    </article>
  );
}
