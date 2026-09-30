import { Gamepad2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-app">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-fg">
          <Gamepad2 className="size-6 text-brand" aria-hidden />
          GameCafe Manager
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-semibold text-fg">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && (
            <p className="mt-6 text-center text-sm text-muted">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}
