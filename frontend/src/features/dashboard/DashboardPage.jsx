import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchDevices } from "../../api/devices.js";
import { fetchPricing } from "../../api/pricing.js";
import { fetchDashboardReport } from "../../api/reports.js";
import { Button } from "../../components/ui/Button.jsx";
import { formatPaise } from "../../utils/format.js";
import {
  useActiveSessions,
  usePauseSession,
  useResumeSession,
} from "../sessions/hooks.js";
import DeviceCard from "./DeviceCard.jsx";
import StartSessionDialog from "./StartSessionDialog.jsx";
import StopSessionDialog from "./StopSessionDialog.jsx";

const TYPE_LABEL = { pc: "PCs", ps5: "PS5", xbox: "Xbox", other: "Other" };

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

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 cursor-pointer rounded-full border px-3 text-sm font-medium transition ${
        active
          ? "border-brand bg-brand/15 text-brand"
          : "border-line text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isOwner = user.role === "owner";

  const [typeFilter, setTypeFilter] = useState("all");
  const [startDevice, setStartDevice] = useState(null);
  const [stopId, setStopId] = useState(null);

  const devicesQ = useQuery({ queryKey: ["devices"], queryFn: fetchDevices });
  const pricingQ = useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });
  const activeQ = useActiveSessions();
  const statsQ = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: fetchDashboardReport,
    enabled: isOwner, // revenue is owner-only
    refetchInterval: 30_000,
  });

  const pause = usePauseSession();
  const resume = useResumeSession();
  const busyId = pause.isPending
    ? pause.variables
    : resume.isPending
      ? resume.variables
      : null;

  const devices = devicesQ.data?.devices ?? [];
  const sessions = activeQ.data?.sessions ?? [];
  const offsetMs = activeQ.data?.offsetMs ?? 0;
  const sessionByDevice = new Map(sessions.map((s) => [s.deviceId, s]));
  const pricedTypes = new Set(
    (pricingQ.data?.rules ?? []).map((r) => r.deviceType),
  );

  const types = [...new Set(devices.map((d) => d.type))];
  const visible =
    typeFilter === "all"
      ? devices
      : devices.filter((d) => d.type === typeFilter);

  const running = sessions.filter((s) => s.status === "running").length;
  const paused = sessions.filter((s) => s.status === "paused").length;
  const free = devices.filter((d) => !sessionByDevice.has(d.id)).length;

  const loading = devicesQ.isPending || activeQ.isPending;
  const loadFailed =
    (devicesQ.isError && !devicesQ.data) || (activeQ.isError && !activeQ.data);
  const stats = statsQ.data;

  if (loadFailed) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-busy/40 bg-busy/10 p-5 text-center"
      >
        <p className="text-busy">{(devicesQ.error ?? activeQ.error).message}</p>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => {
            devicesQ.refetch();
            activeQ.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeQ.isRefetchError && (
        <p
          role="status"
          className="rounded-lg border border-paused/40 bg-paused/10 px-3 py-2 text-sm text-paused"
        >
          Connection problem. Showing the last known data, reconnecting...
        </p>
      )}

      {isOwner && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat
            label="Today"
            value={stats ? formatPaise(stats.today.revenue) : "—"}
            sub={stats ? `${formatPaise(stats.today.collected)} collected` : ""}
          />
          <Stat
            label="Sessions"
            value={stats ? stats.today.sessions : "—"}
            sub="completed today"
          />
          <Stat
            label="To collect"
            value={stats ? formatPaise(stats.outstanding.amount) : "—"}
            sub={stats ? `${stats.outstanding.count} unpaid` : ""}
          />
        </div>
      )}

      {!loading && devices.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-free">{free} free</span>
            {" · "}
            <span className="font-medium text-busy">{running} running</span>
            {" · "}
            <span className="font-medium text-paused">{paused} paused</span>
          </p>
          {types.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Chip
                active={typeFilter === "all"}
                onClick={() => setTypeFilter("all")}
              >
                All
              </Chip>
              {types.map((t) => (
                <Chip
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                >
                  {TYPE_LABEL[t] ?? t}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-line bg-surface"
            />
          ))}
        </div>
      )}

      {!loading && devices.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-fg">No devices yet</h2>
          <p className="mt-1 text-sm text-muted">
            {isOwner
              ? "Add your PCs and consoles to start tracking sessions."
              : "Ask the café owner to add the devices."}
          </p>
          {isOwner && (
            <Link
              to="/setup"
              className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 font-medium text-brand-fg hover:opacity-90"
            >
              Go to setup
            </Link>
          )}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((device) => {
            const session = sessionByDevice.get(device.id);
            return (
              <DeviceCard
                key={device.id}
                device={device}
                session={session}
                offsetMs={offsetMs}
                hasPrice={pricingQ.data ? pricedTypes.has(device.type) : true}
                busy={!!session && busyId === session.id}
                onStart={() => setStartDevice(device)}
                onPause={() => pause.mutate(session.id)}
                onResume={() => resume.mutate(session.id)}
                onStop={() => setStopId(session.id)}
              />
            );
          })}
        </div>
      )}

      {startDevice && (
        <StartSessionDialog
          device={startDevice}
          onClose={() => setStartDevice(null)}
        />
      )}
      {stopId && (
        <StopSessionDialog sessionId={stopId} onClose={() => setStopId(null)} />
      )}
    </div>
  );
}
