import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import Chip from "../../components/ui/Chip.jsx";
import { LoadError, Skeleton } from "../../components/QueryState.jsx";
import { istDayEndIso, istDayStartIso } from "../../utils/date.js";
import { formatDate, formatPaise, formatTime } from "../../utils/format.js";
import { PAYMENT_LABEL } from "../../utils/labels.js";
import { useBills } from "./hooks.js";
import { PayBillDialog, VoidBillDialog } from "./BillDialogs.jsx";

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { id: "all", label: "All", params: {} },
  {
    id: "unpaid",
    label: "Unpaid",
    params: { paymentStatus: "unpaid", voided: false },
  },
  {
    id: "paid",
    label: "Paid",
    params: { paymentStatus: "paid", voided: false },
  },
  { id: "voided", label: "Voided", params: { voided: true } },
];

const BADGE = "rounded-full px-2.5 py-0.5 text-xs font-medium";

function StatusBadge({ bill }) {
  if (bill.voided)
    return <span className={`${BADGE} bg-busy/15 text-busy`}>Voided</span>;
  if (bill.paymentStatus === "paid") {
    return (
      <span className={`${BADGE} bg-free/15 text-free`}>
        Paid · {PAYMENT_LABEL[bill.paymentMethod] ?? bill.paymentMethod}
      </span>
    );
  }
  return <span className={`${BADGE} bg-paused/15 text-paused`}>Unpaid</span>;
}

function BillCard({ bill, isOwner, onPay, onVoid }) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">
            {bill.deviceName}
            {bill.customerName && (
              <span className="font-normal text-muted">
                {" "}
                · {bill.customerName}
              </span>
            )}
            {bill.players > 1 && (
              <span className="font-normal text-muted">
                {" "}
                · {bill.players} players
              </span>
            )}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {formatDate(bill.endTime)} · {formatTime(bill.startTime)} –{" "}
            {formatTime(bill.endTime)} · {bill.billedMinutes} min
          </p>
        </div>
        <p
          className={`shrink-0 text-lg font-semibold tabular-nums ${
            bill.voided ? "text-muted line-through" : "text-money"
          }`}
        >
          {formatPaise(bill.amount)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <StatusBadge bill={bill} />
        {!bill.voided && (
          <div className="flex gap-2">
            {bill.paymentStatus === "unpaid" && (
              <Button onClick={() => onPay(bill)}>Collect</Button>
            )}
            {isOwner && (
              <Button variant="ghost" onClick={() => onVoid(bill)}>
                Void
              </Button>
            )}
          </div>
        )}
      </div>

      {bill.voided && bill.voidReason && (
        <p className="mt-2 text-sm text-muted">Reason: {bill.voidReason}</p>
      )}
    </li>
  );
}

export default function BillsPage() {
  const { user } = useAuth();
  const isOwner = user.role === "owner";

  const [f, setF] = useState({ status: "all", from: "", to: "", page: 1 });
  const [dialog, setDialog] = useState(null); // { kind: 'pay' | 'void', bill }

  // Any filter change goes back to page 1
  const update = (patch) => setF((old) => ({ ...old, page: 1, ...patch }));

  const badRange = Boolean(f.from && f.to && f.from > f.to);
  const params = {
    ...STATUS_FILTERS.find((s) => s.id === f.status).params,
    from: f.from ? istDayStartIso(f.from) : undefined,
    to: f.to ? istDayEndIso(f.to) : undefined,
    page: f.page,
    limit: PAGE_SIZE,
  };
  const q = useBills(params, !badRange);
  const data = q.data;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-fg">Bills</h1>

      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Chip
              key={s.id}
              active={f.status === s.id}
              onClick={() => update({ status: s.id })}
            >
              {s.label}
            </Chip>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="From"
            type="date"
            value={f.from}
            onChange={(e) => update({ from: e.target.value })}
          />
          <Input
            label="To"
            type="date"
            value={f.to}
            onChange={(e) => update({ to: e.target.value })}
          />
        </div>
        {(f.from || f.to) && (
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-brand hover:underline"
            onClick={() => update({ from: "", to: "" })}
          >
            Clear dates
          </button>
        )}
        {badRange && (
          <p className="text-sm text-busy">
            The start date must not be after the end date.
          </p>
        )}
      </div>

      {!badRange && q.isPending && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {!badRange && q.isError && !data && (
        <LoadError error={q.error} onRetry={() => q.refetch()} />
      )}

      {!badRange && data && (
        <>
          <p className="text-sm text-muted">
            {data.total} bill{data.total === 1 ? "" : "s"}
          </p>

          {data.bills.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center">
              <h2 className="text-lg font-semibold text-fg">No bills found</h2>
              <p className="mt-1 text-sm text-muted">
                {f.status === "all" && !f.from && !f.to
                  ? "Bills appear here when a session is stopped."
                  : "Nothing matches these filters."}
              </p>
            </div>
          ) : (
            <ul
              className={`space-y-3 transition-opacity ${q.isPlaceholderData ? "opacity-60" : ""}`}
            >
              {data.bills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  isOwner={isOwner}
                  onPay={(b) => setDialog({ kind: "pay", bill: b })}
                  onVoid={(b) => setDialog({ kind: "void", bill: b })}
                />
              ))}
            </ul>
          )}

          {data.pages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={data.page <= 1}
                onClick={() => setF((old) => ({ ...old, page: old.page - 1 }))}
              >
                Previous
              </Button>
              <p className="text-sm text-muted">
                Page {data.page} of {data.pages}
              </p>
              <Button
                variant="ghost"
                disabled={data.page >= data.pages}
                onClick={() => setF((old) => ({ ...old, page: old.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {dialog?.kind === "pay" && (
        <PayBillDialog bill={dialog.bill} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "void" && (
        <VoidBillDialog bill={dialog.bill} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
