import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client.js";
import TopBar from "../../components/TopBar.jsx";
import { Button } from "../../components/ui/Button.jsx";

const BADGE = {
  trial: "bg-brand/15 text-brand",
  active: "bg-free/15 text-free",
  grace: "bg-paused/15 text-paused",
  expired: "bg-busy/15 text-busy",
};

const daysLeft = (iso) => Math.ceil((new Date(iso) - Date.now()) / 86_400_000);

export default function DashboardPage() {
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ["cafe"],
    queryFn: () => api("/cafe"),
  });

  const cafe = data?.cafe;
  const left = cafe ? daysLeft(cafe.expiresAt) : null;

  return (
    <div className="min-h-dvh bg-app">
      <TopBar />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-line bg-surface p-5">
          {isPending && <p className="text-muted">Loading your café...</p>}
          {error && (
            <p role="alert" className="text-busy">
              {error.message}
            </p>
          )}
          {cafe && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold text-fg">{cafe.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${BADGE[cafe.effectiveStatus] ?? ""}`}
                >
                  {cafe.effectiveStatus}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {left >= 0
                  ? `${left} day${left === 1 ? "" : "s"} left`
                  : `Expired ${-left} days ago`}
                {" · "}ends{" "}
                {new Date(cafe.expiresAt).toLocaleDateString("en-IN")}
              </p>
            </>
          )}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">
            The frontend foundation is working. The live device grid comes in
            the next step.
          </p>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
        </section>
      </main>
    </div>
  );
}
