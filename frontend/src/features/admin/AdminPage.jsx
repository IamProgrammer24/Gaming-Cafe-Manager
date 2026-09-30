import TopBar from "../../components/TopBar.jsx";

export default function AdminPage() {
  return (
    <div className="min-h-dvh bg-app">
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h1 className="text-xl font-semibold text-fg">Super Admin</h1>
          <p className="mt-2 text-sm text-muted">
            Your café overview screen will be built here in a later step.
          </p>
        </section>
      </main>
    </div>
  );
}
