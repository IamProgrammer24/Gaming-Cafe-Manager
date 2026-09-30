import { useState } from "react";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { sessionErrorMessage, useStartSession } from "../sessions/hooks.js";

export default function StartSessionDialog({ device, onClose }) {
  const start = useStartSession();
  const [customerName, setCustomerName] = useState("");

  function submit(e) {
    e.preventDefault();
    start.mutate(
      { deviceId: device.id, customerName: customerName.trim() || undefined },
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
