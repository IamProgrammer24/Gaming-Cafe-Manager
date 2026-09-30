import { Gamepad2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 font-semibold text-fg">
          <Gamepad2 className="size-6 text-brand" aria-hidden />
          <span className="hidden sm:inline">GameCafe Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="max-w-32 truncate text-sm text-muted">
            {user.name}
          </span>
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
  );
}
