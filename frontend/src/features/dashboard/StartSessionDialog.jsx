import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { formatPaise } from "../../utils/format.js";
import { playerOptions } from "../../utils/pricing.js";
import { sessionErrorMessage, useStartSession } from "../sessions/hooks.js";

export default function StartSessionDialog({ device, rule, onClose }) {
  const start = useStartSession();
  const [customerName, setCustomerName] = useState("");
  const [players, setPlayers] = useState(1);
  const options = playerOptions(rule);

  function submit(e) {
    e.preventDefault();
    start.mutate(
      {
        deviceId: device.id,
        customerName: customerName.trim() || undefined,
        players,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      title={`Start ${device.name}`}
      onClose={onClose}
      locked={start.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Only shown when this device type has prices for more than one group size */}
        {options.length > 1 && (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-fg">
              Players
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {options.map((o) => (
                <button
                  key={o.players}
                  type="button"
                  aria-pressed={players === o.players}
                  onClick={() => setPlayers(o.players)}
                  className={`min-h-14 cursor-pointer rounded-lg border px-3 py-2 text-left transition ${
                    players === o.players
                      ? "border-brand bg-brand/15"
                      : "border-line hover:border-brand"
                  }`}
                >
                  <span
                    className={`block font-semibold ${players === o.players ? "text-brand" : "text-fg"}`}
                  >
                    {o.players} player{o.players === 1 ? "" : "s"}
                  </span>
                  <span className="block text-xs text-muted">
                    {formatPaise(o.ratePerHour)}/hr
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <Input
          label="Customer name (optional)"
          name="customerName"
          autoComplete="off"
          maxLength={60}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        {start.error && (
          <ErrorNote>{sessionErrorMessage(start.error)}</ErrorNote>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={start.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={start.isPending}>
            Start
          </Button>
        </div>
      </form>
    </Modal>
  );
}
