import { Loader2 } from "lucide-react";

export default function FullPageSpinner() {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-app text-muted"
      role="status"
      aria-label="Loading"
    >
      <Loader2 className="size-8 animate-spin" />
    </div>
  );
}
