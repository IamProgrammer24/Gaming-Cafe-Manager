import { formatPaise } from "../utils/format.js";

// items: [{ key, value (paise), title, label? }]
export default function BarChart({ items, ariaLabel, height = 160 }) {
  const max = Math.max(0, ...items.map((i) => i.value));
  const hasLabels = items.some((i) => i.label);

  return (
    <div role="img" aria-label={ariaLabel}>
      <p className="mb-2 text-xs text-muted">Highest: {formatPaise(max)}</p>
      <div className="flex items-end gap-px sm:gap-1" style={{ height }}>
        {items.map((i) => (
          <div
            key={i.key}
            title={i.title}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div
              className={i.value > 0 ? "rounded-t bg-brand" : "bg-line"}
              style={{
                height:
                  i.value > 0
                    ? `${Math.max((i.value / max) * 100, 3)}%`
                    : "2px",
              }}
            />
          </div>
        ))}
      </div>
      {hasLabels && (
        <div className="mt-1 flex gap-px text-[10px] text-muted sm:gap-1">
          {items.map((i) => (
            <span key={i.key} className="min-w-0 flex-1 text-center">
              {i.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
