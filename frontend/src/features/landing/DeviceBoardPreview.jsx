// Decorative sample, not live data. It uses the same colours as the real dashboard.
const SAMPLE = [
  {
    name: "PC 01",
    state: "running",
    time: "01:12:40",
    amount: "₹73",
    who: "Amit",
  },
  { name: "PC 02", state: "free" },
  {
    name: "PS5 01",
    state: "running",
    time: "00:36:12",
    amount: "₹62",
    who: "Rohan",
  },
  { name: "PC 03", state: "paused", time: "00:18:05", amount: "₹19" },
];

const STATE = {
  free: {
    label: "Free",
    dot: "bg-free",
    text: "text-free",
    border: "border-line",
  },
  running: {
    label: "Running",
    dot: "bg-busy",
    text: "text-busy",
    border: "border-busy/50",
  },
  paused: {
    label: "Paused",
    dot: "bg-paused",
    text: "text-paused",
    border: "border-paused/50",
  },
};

export default function DeviceBoardPreview() {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-3 shadow-lg sm:p-4">
      <div aria-hidden="true">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-line bg-app p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
              Today
            </p>
            <p className="text-lg font-semibold tabular-nums text-fg">₹1,840</p>
          </div>
          <div className="rounded-xl border border-line bg-app p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
              To collect
            </p>
            <p className="text-lg font-semibold tabular-nums text-fg">₹240</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {SAMPLE.map((d) => {
            const st = STATE[d.state];
            return (
              <div
                key={d.name}
                className={`rounded-xl border bg-app p-3 ${st.border}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-fg">{d.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${st.text}`}
                  >
                    <span className={`size-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                </div>
                <div className="mt-2 min-h-12">
                  {d.time ? (
                    <>
                      <p
                        className={`text-lg font-semibold tabular-nums ${
                          d.state === "paused" ? "text-paused" : "text-fg"
                        }`}
                      >
                        {d.time}
                      </p>
                      <p className="text-xs font-medium text-money">
                        {d.amount}{" "}
                        <span className="font-normal text-muted">so far</span>
                        {d.who && (
                          <span className="font-normal text-muted">
                            {" "}
                            · {d.who}
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted">Ready for a customer</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">
        Sample data. This is what your device board looks like.
      </figcaption>
    </figure>
  );
}
