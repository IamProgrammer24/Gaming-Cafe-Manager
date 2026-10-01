export default function Chip({ active, onClick, children }) {
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
