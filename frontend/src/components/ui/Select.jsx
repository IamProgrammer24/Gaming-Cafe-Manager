import { useId } from "react";

export function Select({
  label,
  error,
  hint,
  className = "",
  children,
  ...props
}) {
  const id = useId();
  const describedBy = `${id}-desc`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? describedBy : undefined}
        className={`w-full rounded-lg border bg-app px-3 py-2.5 text-base text-fg outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 ${
          error ? "border-busy" : "border-line"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={describedBy} className="text-sm text-busy">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
