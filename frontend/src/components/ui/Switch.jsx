import { useId } from "react";

export function Switch({ checked, onChange, label, hint }) {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span id={`${id}-label`} className="block text-sm font-medium text-fg">
          {label}
        </span>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition ${
          checked ? "border-brand bg-brand" : "border-line bg-app"
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full shadow transition-transform ${
            checked ? "translate-x-6 bg-white" : "translate-x-1 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}
