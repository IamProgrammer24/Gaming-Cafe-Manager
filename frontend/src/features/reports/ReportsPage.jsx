import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useToast } from "../../context/ToastContext.jsx";
import {
  downloadBillsCsv,
  fetchBreakdownReport,
  fetchDailyReport,
  fetchMonthlyReport,
} from "../../api/reports.js";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import Chip from "../../components/ui/Chip.jsx";
import BarChart from "../../components/BarChart.jsx";
import { LoadError, Skeleton } from "../../components/QueryState.jsx";
import {
  addDays,
  daysBetween,
  istToday,
  monthStart,
} from "../../utils/date.js";
import {
  formatMonthShort,
  formatPaise,
  formatYmd,
} from "../../utils/format.js";
import { typeMeta } from "../../utils/deviceTypes.js";
import { PAYMENT_LABEL } from "../../utils/labels.js";

const MAX_DAYS = 92;
const PRESETS = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["month", "This month"],
  ["custom", "Custom"],
];

function resolveRange(preset, custom, today) {
  if (preset === "today") return { from: today, to: today };
  if (preset === "7d") return { from: addDays(today, -6), to: today };
  if (preset === "30d") return { from: addDays(today, -29), to: today };
  if (preset === "month") return { from: monthStart(today), to: today };

  const { from, to } = custom;
  if (!from || !to) return { error: "Choose both dates." };
  if (from > to)
    return { error: "The start date must not be after the end date." };
  if (daysBetween(from, to) + 1 > MAX_DAYS)
    return { error: `Choose at most ${MAX_DAYS} days.` };
  return { from, to };
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

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Exact numbers for people who cannot hover over bars (phones, screen readers)
function DataTable({ head, rows }) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-sm font-medium text-brand">
        Show table
      </summary>
      <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-app text-muted">
            <tr>
              {head.map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2 font-medium ${i > 0 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-fg">
            {rows.map((r) => (
              <tr key={r[0]}>
                {r.map((cell, i) => (
                  <td
                    key={i}
                    className={`px-3 py-1.5 tabular-nums ${i > 0 ? "text-right" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function ShareList({ rows, empty }) {
  const total = rows.reduce((sum, r) => sum + r.revenue, 0);
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-fg">{r.label}</span>
            <span className="tabular-nums text-fg">
              {formatPaise(r.revenue)}
              <span className="text-muted">
                {" "}
                · {r.sessions} session{r.sessions === 1 ? "" : "s"}
              </span>
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-app">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${total ? Math.max((r.revenue / total) * 100, 2) : 0}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonthlyReport() {
  const thisYear = Number(istToday().slice(0, 4));
  const [year, setYear] = useState(thisYear);
  const q = useQuery({
    queryKey: ["reports", "monthly", year],
    queryFn: () => fetchMonthlyReport(year),
    placeholderData: keepPreviousData,
  });

  const items = (q.data?.months ?? []).map((m) => ({
    key: m.month,
    value: m.revenue,
    label: formatMonthShort(m.month),
    title: `${formatMonthShort(m.month)} · ${formatPaise(m.revenue)} · ${m.sessions} sessions`,
  }));

  return (
    <Card title="Revenue by month">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous year"
          disabled={year <= 2024}
          onClick={() => setYear((y) => y - 1)}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-line text-muted hover:text-fg disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-semibold tabular-nums text-fg">{year}</p>
        <button
          type="button"
          aria-label="Next year"
          disabled={year >= thisYear}
          onClick={() => setYear((y) => y + 1)}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-line text-muted hover:text-fg disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {q.isPending && <Skeleton className="h-52 border-0" />}
      {q.isError && !q.data && (
        <LoadError error={q.error} onRetry={() => q.refetch()} />
      )}
      {q.data && (
        <div
          className={q.isPlaceholderData ? "opacity-60 transition-opacity" : ""}
        >
          <p className="mb-3 text-sm text-muted">
            Total for {q.data.year}:{" "}
            <span className="font-medium text-money">
              {formatPaise(q.data.totals.revenue)}
            </span>{" "}
            · {q.data.totals.sessions} sessions
          </p>
          <BarChart
            items={items}
            ariaLabel={`Revenue by month for ${q.data.year}`}
          />
          <DataTable
            head={["Month", "Sessions", "Revenue", "Collected"]}
            rows={q.data.months.map((m) => [
              m.month,
              m.sessions,
              formatPaise(m.revenue),
              formatPaise(m.collected),
            ])}
          />
        </div>
      )}
    </Card>
  );
}

export default function ReportsPage() {
  const toast = useToast();
  const today = istToday();
  const [preset, setPreset] = useState("7d");
  const [custom, setCustom] = useState({ from: addDays(today, -6), to: today });
  const [exporting, setExporting] = useState(false);

  const range = useMemo(
    () => resolveRange(preset, custom, today),
    [preset, custom, today],
  );
  const ready = !range.error;
  const rangeKey = [range.from, range.to];

  const breakdownQ = useQuery({
    queryKey: ["reports", "breakdown", ...rangeKey],
    queryFn: () => fetchBreakdownReport(range),
    enabled: ready,
    placeholderData: keepPreviousData,
  });
  const dailyQ = useQuery({
    queryKey: ["reports", "daily", ...rangeKey],
    queryFn: () => fetchDailyReport(range),
    enabled: ready,
    placeholderData: keepPreviousData,
  });

  async function exportCsv() {
    setExporting(true);
    try {
      const { blob, filename } = await downloadBillsCsv(range);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  }

  const b = breakdownQ.data;
  const days = dailyQ.data?.days ?? [];
  const dayItems = days.map((d) => ({
    key: d.date,
    value: d.revenue,
    title: `${formatYmd(d.date)} · ${formatPaise(d.revenue)} · ${d.sessions} sessions`,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-fg">Reports</h1>
        <Button
          variant="ghost"
          onClick={exportCsv}
          loading={exporting}
          disabled={!ready}
        >
          <Download className="size-4" aria-hidden /> Export CSV
        </Button>
      </div>

      <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(([id, label]) => (
            <Chip key={id} active={preset === id} onClick={() => setPreset(id)}>
              {label}
            </Chip>
          ))}
        </div>
        {preset === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From"
              type="date"
              max={today}
              value={custom.from}
              onChange={(e) =>
                setCustom((c) => ({ ...c, from: e.target.value }))
              }
            />
            <Input
              label="To"
              type="date"
              max={today}
              value={custom.to}
              onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))}
            />
          </div>
        )}
        {range.error ? (
          <p className="text-sm text-busy">{range.error}</p>
        ) : (
          <p className="text-sm text-muted">
            {range.from === range.to
              ? formatYmd(range.from)
              : `${formatYmd(range.from)} to ${formatYmd(range.to)}`}{" "}
            · days follow Indian time (IST)
          </p>
        )}
      </section>

      {ready && breakdownQ.isPending && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      {ready && breakdownQ.isError && !b && (
        <LoadError
          error={breakdownQ.error}
          onRetry={() => breakdownQ.refetch()}
        />
      )}

      {ready && b && (
        <div
          className={`space-y-4 ${breakdownQ.isPlaceholderData ? "opacity-60 transition-opacity" : ""}`}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Revenue"
              value={formatPaise(b.revenue)}
              sub={`${b.sessions} sessions`}
            />
            <Stat label="Collected" value={formatPaise(b.collected)} />
            <Stat
              label="To collect"
              value={formatPaise(b.pending)}
              sub="unpaid bills"
            />
            <Stat
              label="Hours played"
              value={(b.billedMinutes / 60).toFixed(1)}
              sub="billed time"
            />
          </div>

          {b.voided.count > 0 && (
            <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
              {b.voided.count} voided bill{b.voided.count === 1 ? "" : "s"} (
              {formatPaise(b.voided.amount)}) not counted in revenue.
            </p>
          )}

          {b.sessions === 0 && b.voided.count === 0 && (
            <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
              No sales in this period.
            </p>
          )}

          <Card title="Revenue per day">
            {dailyQ.isError && !dailyQ.data ? (
              <LoadError
                error={dailyQ.error}
                onRetry={() => dailyQ.refetch()}
              />
            ) : dailyQ.data ? (
              <div
                className={
                  dailyQ.isPlaceholderData
                    ? "opacity-60 transition-opacity"
                    : ""
                }
              >
                <BarChart items={dayItems} ariaLabel="Revenue per day" />
                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>{formatYmd(days[0].date)}</span>
                  <span>{formatYmd(days[days.length - 1].date)}</span>
                </div>
                <DataTable
                  head={["Date", "Sessions", "Revenue", "Collected"]}
                  rows={[...days]
                    .reverse()
                    .map((d) => [
                      formatYmd(d.date),
                      d.sessions,
                      formatPaise(d.revenue),
                      formatPaise(d.collected),
                    ])}
                />
              </div>
            ) : (
              <Skeleton className="h-48 border-0" />
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="By device type">
              <ShareList
                empty="No sessions in this period."
                rows={b.byDeviceType.map((r) => ({
                  key: r.deviceType,
                  label: typeMeta(r.deviceType).label,
                  revenue: r.revenue,
                  sessions: r.sessions,
                }))}
              />
            </Card>
            <Card title="By payment method">
              <ShareList
                empty="No sessions in this period."
                rows={b.byPaymentMethod.map((r) => ({
                  key: r.method,
                  label: PAYMENT_LABEL[r.method] ?? r.method,
                  revenue: r.revenue,
                  sessions: r.sessions,
                }))}
              />
            </Card>
          </div>
        </div>
      )}

      <MonthlyReport />
    </div>
  );
}
