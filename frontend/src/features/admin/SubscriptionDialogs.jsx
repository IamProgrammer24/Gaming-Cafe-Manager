import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import Chip from "../../components/ui/Chip.jsx";
import { istDayEndIso } from "../../utils/date.js";
import { formatDate } from "../../utils/format.js";
import { useUpdateSubscription } from "./hooks.js";

const DAY_MS = 86_400_000;
const PRESETS = ["30", "90", "365"];

export function ExtendDialog({ cafe, onClose }) {
  const update = useUpdateSubscription();
  const [mode, setMode] = useState("days"); // 'days' | 'date'
  const [days, setDays] = useState("30");
  const [date, setDate] = useState("");
  const [localError, setLocalError] = useState("");

  const n = Number(days);
  const daysValid = Number.isInteger(n) && n >= 1 && n <= 366;

  // Same rule as the server: extend from the later of "now" and the current end date.
  const base = Math.max(Date.now(), Date.parse(cafe.expiresAt));
  const preview =
    mode === "days"
      ? daysValid
        ? formatDate(new Date(base + n * DAY_MS).toISOString())
        : ""
      : date
        ? formatDate(istDayEndIso(date))
        : "";

  function submit(e) {
    e.preventDefault();
    setLocalError("");

    let body;
    if (mode === "days") {
      if (!daysValid)
        return setLocalError("Enter a whole number of days from 1 to 366.");
      body = { extendDays: n };
    } else {
      if (!date) return setLocalError("Choose an end date.");
      body = { expiresAt: istDayEndIso(date), status: "active" };
    }
    update.mutate({ id: cafe.id, body }, { onSuccess: onClose });
  }

  const error = localError || update.error?.message;

  return (
    <Modal
      title={`Extend ${cafe.name}`}
      onClose={onClose}
      locked={update.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          Currently ends {formatDate(cafe.expiresAt)}. Extending also unlocks
          the café and marks it as a paying plan.
        </p>

        <div className="flex gap-2">
          <Chip active={mode === "days"} onClick={() => setMode("days")}>
            Add days
          </Chip>
          <Chip active={mode === "date"} onClick={() => setMode("date")}>
            Set end date
          </Chip>
        </div>

        {mode === "days" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Chip key={p} active={days === p} onClick={() => setDays(p)}>
                  {p} days
                </Chip>
              ))}
            </div>
            <Input
              label="Days to add"
              type="number"
              inputMode="numeric"
              min={1}
              max={366}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        ) : (
          <Input
            label="New end date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}

        {preview && (
          <p className="rounded-lg border border-line bg-app px-3 py-2 text-sm text-muted">
            New end date: <span className="font-medium text-fg">{preview}</span>
          </p>
        )}

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={update.isPending}>
            Extend
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function LockDialog({ cafe, mode, onClose }) {
  const update = useUpdateSubscription();
  const locking = mode === "lock";

  function submit(e) {
    e.preventDefault();
    update.mutate(
      { id: cafe.id, body: { status: locking ? "expired" : "active" } },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      title={locking ? `Lock ${cafe.name}?` : `Unlock ${cafe.name}?`}
      onClose={onClose}
      locked={update.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">
          {locking
            ? "The owner and staff lose access straight away and see the renewal screen. Nothing is deleted, and unlocking restores everything."
            : `Access returns straight away and runs until the current end date (${formatDate(cafe.expiresAt)}).`}
        </p>
        {update.error && <ErrorNote>{update.error.message}</ErrorNote>}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={locking ? "danger" : "primary"}
            loading={update.isPending}
          >
            {locking ? "Lock café" : "Unlock café"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
