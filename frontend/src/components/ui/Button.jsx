import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand text-brand-fg hover:opacity-90",
  ghost: "border border-line text-fg hover:bg-app",
};

export function Button({
  variant = "primary",
  loading = false,
  type = "button",
  disabled,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
