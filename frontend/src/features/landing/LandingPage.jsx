import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Gamepad2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import { SUPPORT_CONTACT } from "../../config.js";
import { homePathFor } from "../../utils/paths.js";
import DeviceBoardPreview from "./DeviceBoardPreview.jsx";
import { FAQ, FEATURES, NOT_YET, PROBLEMS, STEPS } from "./content.js";

const BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium transition";
const PRIMARY = `${BTN} bg-brand text-brand-fg hover:opacity-90`;
const GHOST = `${BTN} border border-line text-fg hover:bg-surface`;

function Section({ id, title, intro, alt = false, children }) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 py-14 sm:py-16 ${alt ? "border-y border-line bg-surface" : ""}`}
    >
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-semibold text-fg sm:text-3xl">{title}</h2>
        {intro && <p className="mt-2 max-w-2xl text-muted">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { status, user } = useAuth();

  // Logged-in owners go straight to their dashboard. Visitors see the page immediately.
  if (status === "authenticated")
    return <Navigate to={homePathFor(user.role)} replace />;

  return (
    <div className="min-h-dvh bg-app text-fg">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-fg"
          >
            <Gamepad2 className="size-6 text-brand" aria-hidden />
            <span className="hidden min-[400px]:inline">GameCafe Manager</span>
          </Link>

          <nav
            aria-label="Page sections"
            className="hidden items-center gap-6 text-sm font-medium text-muted md:flex"
          >
            <a href="#how-it-works" className="hover:text-fg">
              How it works
            </a>
            <a href="#features" className="hover:text-fg">
              Features
            </a>
            <a href="#faq" className="hover:text-fg">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-2 text-sm font-medium text-fg hover:text-brand"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={`${PRIMARY} !min-h-10 !px-3 text-sm`}
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-12 sm:py-16 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-fg sm:text-4xl lg:text-5xl">
              Run your gaming café from your phone
            </h1>
            <p className="mt-4 text-lg text-muted">
              Track every PC and console, bill customers automatically, and see
              what you earned today. No paper, no arguments, nothing to install.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className={PRIMARY}>
                Start free trial <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link to="/login" className={GHOST}>
                Log in
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              Free for 15 days. No card needed.
            </p>
          </div>
          <DeviceBoardPreview />
        </section>

        {/* The problem */}
        <Section
          alt
          title="Sound familiar?"
          intro="Most café owners run on notebooks, memory and trust. That works until it doesn't."
        >
          <ul className="grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <li
                key={p.title}
                className="rounded-2xl border border-line bg-app p-5"
              >
                <h3 className="font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* How it works */}
        <Section
          id="how-it-works"
          title="How it works"
          intro="You can be running your first session in about ten minutes."
        >
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-brand/15 font-semibold text-brand">
                    {i + 1}
                  </span>
                  <s.icon className="size-5 text-muted" aria-hidden />
                </div>
                <h3 className="mt-3 font-semibold text-fg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Features */}
        <Section
          alt
          id="features"
          title="Everything you need to run the counter"
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex gap-4 rounded-2xl border border-line bg-app p-5"
              >
                <f.icon
                  className="mt-0.5 size-6 shrink-0 text-brand"
                  aria-hidden
                />
                <div>
                  <h3 className="font-semibold text-fg">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Honest limits */}
        <Section title="Good to know before you start">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="flex items-center gap-2 font-semibold text-fg">
                <Check className="size-5 text-free" aria-hidden /> What it is
              </h3>
              <p className="mt-2 text-sm text-muted">
                A timing, billing and reporting tool for your counter. Your
                staff start and stop sessions, and the software does the timing,
                the maths and the record keeping.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="flex items-center gap-2 font-semibold text-fg">
                <X className="size-5 text-paused" aria-hidden /> Not in this
                Beta yet
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {NOT_YET.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted">
                Tell us which one you need most.
              </p>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section alt id="faq" title="Questions café owners ask">
          <div className="max-w-3xl space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-line bg-app"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-medium text-fg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="size-5 shrink-0 text-muted transition group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Final call to action */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-fg sm:text-3xl">
            Try it with your own café
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Set up your devices, run a few real sessions, and see your day's
            earnings. Free for 15 days, no card needed.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className={PRIMARY}>
              Start free trial <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link to="/login" className={GHOST}>
              Log in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} GameCafe Manager · Beta</p>
          <p>
            Questions? Call or WhatsApp{" "}
            <span className="font-medium text-fg">{SUPPORT_CONTACT}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
