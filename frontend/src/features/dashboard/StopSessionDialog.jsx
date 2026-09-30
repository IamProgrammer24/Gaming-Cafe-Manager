import { CheckCircle2 } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { formatPaise } from "../../utils/format.js";
import LiveTimer from "./LiveTimer.jsx";
import {
  sessionErrorMessage,
  useActiveSessions,
  usePayBill,
  useStopSession,
} from "../sessions/hooks.js";

const METHODS = [
  ["cash", "Cash"],
  ["upi", "UPI"],
  ["other", "Other"],
];

export default function StopSessionDialog({ sessionId, onClose }) {
  const { data } = useActiveSessions();
  const stop = useStopSession();
  const pay = usePayBill();

  const live = data?.sessions.find((s) => s.id === sessionId);
  const offsetMs = data?.offsetMs ?? 0;
  const locked = stop.isPending || pay.isPending;

  // 1) Stopped: show the final amount and collect payment
  if (stop.isSuccess) {
    const { session, bill } = stop.data;
    const paidBill = pay.data?.bill;

    return (
      <Modal title="Session ended" onClose={onClose} locked={locked}>
        <div className="text-center">
          <p className="text-sm text-muted">
            {session.deviceName} · {session.billedMinutes} min billed
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-money">
            {formatPaise(session.amount)}
          </p>
        </div>

        {paidBill ? (
          <>
            <p className="flex items-center justify-center gap-2 text-free">
              <CheckCircle2 className="size-5" aria-hidden />
              Paid by {paidBill.paymentMethod}
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </>
        ) : bill ? (
          <>
            <p className="text-sm font-medium text-fg">Collect payment</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(([value, label]) => (
                <Button
                  key={value}
                  variant="ghost"
                  disabled={pay.isPending}
                  loading={
                    pay.isPending && pay.variables?.paymentMethod === value
                  }
                  onClick={() =>
                    pay.mutate({ billId: bill.id, paymentMethod: value })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
            {pay.error && <ErrorNote>{pay.error.message}</ErrorNote>}
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
              disabled={pay.isPending}
            >
              Collect later
            </Button>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-muted">
              The bill will appear on the Bills page in a moment.
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </>
        )}
      </Modal>
    );
  }

  // 2) Someone else already ended it
  if (!live) {
    return (
      <Modal title="Session not found" onClose={onClose}>
        <p className="text-sm text-muted">
          This session has already ended. The board is up to date.
        </p>
        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </Modal>
    );
  }

  // 3) Confirm
  return (
    <Modal title={`Stop ${live.deviceName}?`} onClose={onClose} locked={locked}>
      <div className="rounded-xl border border-line bg-app p-4 text-center">
        <LiveTimer
          session={live}
          offsetMs={offsetMs}
          className="text-3xl font-semibold tabular-nums text-fg"
        />
        <p className="mt-1 font-medium text-money">
          {formatPaise(live.amount)} so far
        </p>
        {live.customerName && (
          <p className="mt-1 text-sm text-muted">{live.customerName}</p>
        )}
      </div>
      <p className="text-sm text-muted">
        The final amount is calculated when you stop. You collect payment on the
        next screen.
      </p>
      {stop.error && <ErrorNote>{sessionErrorMessage(stop.error)}</ErrorNote>}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={onClose} disabled={stop.isPending}>
          Cancel
        </Button>
        <Button
          variant="danger"
          loading={stop.isPending}
          onClick={() => stop.mutate(sessionId)}
        >
          Stop session
        </Button>
      </div>
    </Modal>
  );
}
