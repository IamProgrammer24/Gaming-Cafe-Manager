import { Button } from "./ui/Button.jsx";

export function Skeleton({ className = "h-40" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-line bg-surface ${className}`}
      aria-busy="true"
    />
  );
}

export function LoadError({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-busy/40 bg-busy/10 p-5 text-center"
    >
      <p className="text-busy">{error.message}</p>
      <Button variant="ghost" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
