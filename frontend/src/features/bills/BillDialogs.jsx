import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/ui/Modal.jsx";
import ErrorNote from "../../components/ui/ErrorNote.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatPaise } from "../../utils/format.js";
import { usePayBill } from "../sessions/hooks.js";
import { billErrorMessage, useVoidBill } from "./hooks.js";

const METHODS = [
  ["cash", "Cash"],
  ["upi", "UPI"],
  ["other", "Other"],
];

function Summary({ bill }) {
  return (
    <div className="rounded-xl border border-line bg-app p-3 text-center">
      <p className="text-sm text-muted">
        {bill.deviceName}
        {bill.customerName ? ` · ${bill.customerName}` : ""}
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-money">
        {formatPaise(bill.amount)}
      </p>
    </div>
  );
}

export function PayBillDialog({ bill, onClose }) {
  const pay = usePayBill();
  const qc = useQueryClient();
  const toast = useToast();

  function choose(paymentMethod) {
    pay.mutate(
      { billId: bill.id, paymentMethod },
      {
        onSuccess: () => {
          toast.success("Payment recorded");
          onClose();
        },
        onError: () => qc.invalidateQueries({ queryKey: ["bills"] }),
      },
    );
  }

  return (
    <Modal title="Collect payment" onClose={onClose} locked={pay.isPending}>
      <Summary bill={bill} />
      <div className="grid grid-cols-3 gap-2">
        {METHODS.map(([value, label]) => (
          <Button
            key={value}
            variant="ghost"
            disabled={pay.isPending}
            loading={pay.isPending && pay.variables?.paymentMethod === value}
            onClick={() => choose(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      {pay.error && <ErrorNote>{billErrorMessage(pay.error)}</ErrorNote>}
      <Button
        variant="ghost"
        className="w-full"
        onClick={onClose}
        disabled={pay.isPending}
      >
        Cancel
      </Button>
    </Modal>
  );
}

export function VoidBillDialog({ bill, onClose }) {
  const voidIt = useVoidBill();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");

  function submit(e) {
    e.preventDefault();
    voidIt.mutate(
      { billId: bill.id, reason: reason.trim() },
      {
        onSuccess: onClose,
        onError: () => qc.invalidateQueries({ queryKey: ["bills"] }),
      },
    );
  }

  return (
    <Modal title="Void this bill?" onClose={onClose} locked={voidIt.isPending}>
      <form onSubmit={submit} className="space-y-4">
        <Summary bill={bill} />
        <p className="text-sm text-muted">
          A voided bill is not counted in your revenue. It stays in the list
          with your reason, and this cannot be undone.
        </p>
        <Input
          label="Reason"
          name="reason"
          required
          minLength={3}
          maxLength={200}
          autoComplete="off"
          placeholder="Customer left without playing"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {voidIt.error && (
          <ErrorNote>{billErrorMessage(voidIt.error)}</ErrorNote>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={voidIt.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={voidIt.isPending}>
            Void bill
          </Button>
        </div>
      </form>
    </Modal>
  );
}
