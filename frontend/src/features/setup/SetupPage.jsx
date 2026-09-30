import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { useCafe, useDevices, usePricing } from "./hooks.js";
import CafeSettings from "./CafeSettings.jsx";
import DevicesTab from "./DevicesTab.jsx";
import PricingTab from "./PricingTab.jsx";

const TABS = [
  { id: "cafe", label: "Café" },
  { id: "devices", label: "Devices" },
  { id: "pricing", label: "Pricing" },
];

function Checklist({ steps, onSelect }) {
  const ready = steps.every((s) => s.done);

  return (
    <section
      aria-label="Setup progress"
      className="rounded-2xl border border-line bg-surface p-4"
    >
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-sm transition hover:border-brand"
            >
              {s.done ? (
                <CheckCircle2
                  className="size-5 shrink-0 text-free"
                  aria-hidden
                />
              ) : (
                <Circle className="size-5 shrink-0 text-muted" aria-hidden />
              )}
              <span className={s.done ? "text-muted" : "font-medium text-fg"}>
                {s.label}
              </span>
              <span className="sr-only">{s.done ? "(done)" : "(to do)"}</span>
            </button>
          </li>
        ))}
      </ol>
      {ready && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-free">
            You are all set. Your café is ready to run sessions.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 font-medium text-brand-fg hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      )}
    </section>
  );
}

export default function SetupPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TABS.some((t) => t.id === requested) ? requested : "cafe";
  const goTo = (id) => setParams({ tab: id }, { replace: true });

  const cafeQ = useCafe();
  const devicesQ = useDevices();
  const pricingQ = usePricing();

  const loaded = cafeQ.data && devicesQ.data && pricingQ.data;
  let steps = [];
  if (loaded) {
    const devices = devicesQ.data.devices;
    const priced = new Set(pricingQ.data.rules.map((r) => r.deviceType));
    const usedTypes = [...new Set(devices.map((d) => d.type))];
    steps = [
      {
        id: "cafe",
        label: "Café details",
        done: Boolean(cafeQ.data.cafe.address),
      },
      { id: "devices", label: "Add devices", done: devices.length > 0 },
      {
        id: "pricing",
        label: "Set prices",
        done: devices.length > 0 && usedTypes.every((t) => priced.has(t)),
      },
    ];
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-fg">Setup</h1>

      {loaded && <Checklist steps={steps} onSelect={goTo} />}

      <div
        role="tablist"
        aria-label="Setup sections"
        className="flex gap-1 rounded-xl border border-line bg-surface p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => goTo(t.id)}
            className={`min-h-10 flex-1 cursor-pointer rounded-lg px-3 text-sm font-medium transition ${
              tab === t.id
                ? "bg-brand/15 text-brand"
                : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "cafe" && <CafeSettings />}
        {tab === "devices" && <DevicesTab />}
        {tab === "pricing" && <PricingTab />}
      </div>
    </div>
  );
}
