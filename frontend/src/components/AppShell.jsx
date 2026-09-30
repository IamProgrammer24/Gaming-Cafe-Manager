import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Gamepad2,
  LayoutGrid,
  Loader2,
  LogOut,
  Receipt,
  Settings,
} from "lucide-react";
import { fetchCafe } from "../api/cafe.js";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import SubscriptionBanner from "./SubscriptionBanner.jsx";
import ExpiredNotice from "./ExpiredNotice.jsx";

const NAV = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    roles: ["owner", "staff"],
  },
  { to: "/bills", label: "Bills", icon: Receipt, roles: ["owner", "staff"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["owner"] },
  { to: "/setup", label: "Setup", icon: Settings, roles: ["owner"] },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const isSuperAdmin = user.role === "superadmin";
  const items = NAV.filter((i) => i.roles.includes(user.role));

  // The super admin has no café, so there is nothing to load for them.
  const cafeQ = useQuery({
    queryKey: ["cafe"],
    queryFn: fetchCafe,
    enabled: !isSuperAdmin,
  });
  const cafe = cafeQ.data?.cafe;
  const title = isSuperAdmin
    ? "GameCafe Admin"
    : (cafe?.name ?? "GameCafe Manager");

  let content;
  if (!isSuperAdmin && cafeQ.isPending) {
    content = (
      <div
        className="grid place-items-center py-24 text-muted"
        role="status"
        aria-label="Loading"
      >
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  } else if (cafe?.effectiveStatus === "expired") {
    content = <ExpiredNotice cafe={cafe} />;
  } else {
    content = (
      <>
        <SubscriptionBanner cafe={cafe} />
        <Outlet />
      </>
    );
  }

  return (
    <div className="min-h-dvh bg-app">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2 font-semibold text-fg">
            <Gamepad2 className="size-6 shrink-0 text-brand" aria-hidden />
            <span className="truncate">{title}</span>
          </div>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand/15 text-brand"
                      : "text-muted hover:text-fg"
                  }`
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              aria-label="Log out"
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-lg border border-line text-muted transition hover:text-busy"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 md:pb-8">
        {content}
      </main>

      {items.length > 0 && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface md:hidden"
        >
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                  isActive ? "text-brand" : "text-muted"
                }`
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
