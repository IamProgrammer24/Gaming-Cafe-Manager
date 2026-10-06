import { useMemo, useState } from "react";
import { KeyRound, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import Chip from "../../components/ui/Chip.jsx";
import { LoadError, Skeleton } from "../../components/QueryState.jsx";
import { formatDate, formatPaise } from "../../utils/format.js";
import { useAdminCafes } from "./hooks.js";
import { ExtendDialog, LockDialog } from "./SubscriptionDialogs.jsx";

const DAY_MS = 86_400_000;

const SORTS = [
  {
    id: "newest",
    label: "Newest first",
    fn: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  },
  {
    id: "expiry",
    label: "Expiring soonest",
    fn: (a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt),
  },
  {
    id: "active",
    label: "Last active",
    fn: (a, b) =>
      (b.lastActive ? Date.parse(b.lastActive) : 0) -
      (a.lastActive ? Date.parse(a.lastActive) : 0),
  },
  {
    id: "sessions",
    label: "Most sessions this month",
    fn: (a, b) => b.sessionsThisMonth - a.sessionsThisMonth,
  },
];

const BADGE = {
  trial: "bg-brand/15 text-brand",
  active: "bg-free/15 text-free",
  grace: "bg-paused/15 text-paused",
  expired: "bg-busy/15 text-busy",
};

function statusView(c) {
  // Locked by hand: stored as expired while the end date is still in the future
  if (c.status === "expired" && c.daysLeft > 0)
    return { label: "Locked", cls: BADGE.expired };
  return { label: c.effectiveStatus, cls: BADGE[c.effectiveStatus] ?? "" };
}

function expiryText(c) {
  const diff = Date.parse(c.expiresAt) - Date.now();
  if (diff > 0) {
    const d = Math.ceil(diff / DAY_MS);
    return `${formatDate(c.expiresAt)} (${d} day${d === 1 ? "" : "s"} left)`;
  }
  const ago = Math.floor(-diff / DAY_MS);
  return `${formatDate(c.expiresAt)} (${ago === 0 ? "ended today" : `ended ${ago} day${ago === 1 ? "" : "s"} ago`})`;
}

function relativeDay(iso) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - Date.parse(iso)) / DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function attention(c) {
  if (c.sessionsTotal === 0 && c.accountAgeDays >= 2) return "Never used";
  if (c.lastActive && Date.now() - Date.parse(c.lastActive) > 7 * DAY_MS)
    return "No sessions in 7+ days";
  return null;
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-fg sm:text-2xl">
        {value}
      </p>
      {sub && <p className="truncate text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Fact({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-fg">{children}</dd>
    </div>
  );
}

function CafeCard({ cafe, onAction }) {
  const view = statusView(cafe);
  const note = attention(cafe);
  const canLock = cafe.effectiveStatus !== "expired";
  const canUnlock = cafe.status === "expired" && cafe.daysLeft > 0;

  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-fg">
              {cafe.name}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${view.cls}`}
            >
              {view.label}
            </span>
            <span className="text-xs capitalize text-muted">{cafe.plan}</span>
          </div>
          {note && (
            <p className="mt-1 text-sm font-medium text-paused">{note}</p>
          )}
        </div>
        <p className="shrink-0 text-right text-sm font-semibold tabular-nums text-money">
          {formatPaise(cafe.revenueProcessed)}
          <span className="block text-xs font-normal text-muted">
            processed
          </span>
        </p>
      </div>

      {cafe.owner ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>{cafe.owner.name}</span>
          <a
            href={`mailto:${cafe.owner.email}`}
            className="inline-flex items-center gap-1 hover:text-fg"
          >
            <Mail className="size-3.5" aria-hidden /> {cafe.owner.email}
          </a>
          {cafe.owner.phone && (
            <a
              href={`tel:${cafe.owner.phone}`}
              className="inline-flex items-center gap-1 hover:text-fg"
            >
              <Phone className="size-3.5" aria-hidden /> {cafe.owner.phone}
            </a>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">No owner linked</p>
      )}

      {(cafe.address || cafe.phone) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {cafe.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name} ${cafe.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-fg"
            >
              <MapPin className="size-3.5" aria-hidden /> {cafe.address}
            </a>
          )}
          {cafe.phone && cafe.phone !== cafe.owner?.phone && (
            <a
              href={`tel:${cafe.phone}`}
              className="inline-flex items-center gap-1 hover:text-fg"
            >
              <Phone className="size-3.5" aria-hidden /> Café: {cafe.phone}
            </a>
          )}
        </div>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Fact label="Ends">{expiryText(cafe)}</Fact>
        <Fact label="Devices">{cafe.devices}</Fact>
        <Fact label="Sessions">
          {cafe.sessionsThisMonth} this month
          <span className="font-normal text-muted">
            {" "}
            · {cafe.sessionsTotal} total
          </span>
          <span className="mt-0.5 block text-xs font-normal">
            {cafe.runningNow > 0 ? (
              <span className="text-busy">{cafe.runningNow} running now</span>
            ) : (
              <span className="text-muted">None running now</span>
            )}
            {cafe.pausedNow > 0 && (
              <span className="text-paused"> · {cafe.pausedNow} paused</span>
            )}
          </span>
        </Fact>
        <Fact label="Last active">{relativeDay(cafe.lastActive)}</Fact>
      </dl>
      <p className="mt-2 text-xs text-muted">
        Joined {formatDate(cafe.createdAt)} · {cafe.accountAgeDays} day
        {cafe.accountAgeDays === 1 ? "" : "s"} ago
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => onAction("extend", cafe)}>Extend</Button>
        {canLock && (
          <Button variant="ghost" onClick={() => onAction("lock", cafe)}>
            Lock
          </Button>
        )}
        {canUnlock && (
          <Button variant="ghost" onClick={() => onAction("unlock", cafe)}>
            Unlock
          </Button>
        )}
      </div>
    </li>
  );
}

export default function AdminPage() {
  const q = useAdminCafes();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortId, setSortId] = useState("newest");
  const [dialog, setDialog] = useState(null); // { kind: 'extend' | 'lock' | 'unlock', cafe }

  const data = q.data;

  const list = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    const sort = SORTS.find((s) => s.id === sortId).fn;
    return data.cafes
      .filter((c) => status === "all" || c.effectiveStatus === status)
      .filter(
        (c) =>
          !term ||
          [
            c.name,
            c.owner?.name,
            c.owner?.email,
            c.owner?.phone,
            c.phone,
            c.address,
          ].some((v) => v?.toLowerCase().includes(term)),
      )
      .sort(sort);
  }, [data, search, status, sortId]);

  if (q.isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (q.isError && !data)
    return <LoadError error={q.error} onRetry={() => q.refetch()} />;

  const s = data.summary;
  const filters = [
    ["all", "All", s.totalCafes],
    ["trial", "Trial", s.trial],
    ["active", "Active", s.active],
    ["grace", "Grace", s.grace],
    ["expired", "Expired", s.expired],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-xl font-semibold text-fg">Café overview</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Cafés"
          value={s.totalCafes}
          sub={`${s.newThisMonth} new this month`}
        />
        <Stat label="On trial" value={s.trial} />
        <Stat label="Paying" value={s.payingCafes} sub="active or in grace" />
        <Stat
          label="Active, 7 days"
          value={s.activeLast7Days}
          sub="ran a session"
        />
        <Stat
          label="Sessions today"
          value={s.sessionsToday}
          sub={`${s.runningNow} running now · ${s.sessionsThisMonth} this month`}
        />
        <Stat label="Devices" value={s.totalDevices} sub="across all cafés" />
      </div>

      <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Search"
            type="search"
            autoComplete="off"
            placeholder="Café, owner, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="Sort by"
            value={sortId}
            onChange={(e) => setSortId(e.target.value)}
          >
            {SORTS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(([id, label, count]) => (
            <Chip key={id} active={status === id} onClick={() => setStatus(id)}>
              {label} · {count}
            </Chip>
          ))}
        </div>
      </section>

      {q.isRefetchError && (
        <p
          role="status"
          className="rounded-lg border border-paused/40 bg-paused/10 px-3 py-2 text-sm text-paused"
        >
          Could not refresh. Showing the last data.
        </p>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-fg">
            {data.cafes.length === 0 ? "No cafés yet" : "No cafés match"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {data.cafes.length === 0
              ? "Cafés appear here when an owner registers."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <CafeCard
              key={c.id}
              cafe={c}
              onAction={(kind, cafe) => setDialog({ kind, cafe })}
            />
          ))}
        </ul>
      )}

      {dialog?.kind === "extend" && (
        <ExtendDialog cafe={dialog.cafe} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === "lock" && (
        <LockDialog
          cafe={dialog.cafe}
          mode="lock"
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "unlock" && (
        <LockDialog
          cafe={dialog.cafe}
          mode="unlock"
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
