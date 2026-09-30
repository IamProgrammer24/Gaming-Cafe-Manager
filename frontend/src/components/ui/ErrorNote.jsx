export default function ErrorNote({ children }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-busy/40 bg-busy/10 px-3 py-2 text-sm text-busy"
    >
      {children}
    </div>
  );
}
