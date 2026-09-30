import { useNow } from "../../hooks/useNow.js";
import { formatDuration } from "../../utils/format.js";
import { liveElapsedMs } from "../../utils/session.js";

// Only this small component re-renders every second, not the whole page.
export default function LiveTimer({ session, offsetMs, className = "" }) {
  const now = useNow();
  return (
    <p className={className}>
      {formatDuration(liveElapsedMs(session, offsetMs, now))}
    </p>
  );
}
