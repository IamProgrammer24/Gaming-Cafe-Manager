export default function ComingSoon({ title }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 text-center">
      <h1 className="text-xl font-semibold text-fg">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        This screen is built in an upcoming step.
      </p>
    </section>
  );
}
