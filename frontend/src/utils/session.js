// Time that counts toward the bill, as of nowMs on this device.
// While paused the server's frozen value is used as it is.
export function liveElapsedMs(session, offsetMs, nowMs) {
  if (session.status !== "running") return session.elapsedMs;
  const serverNow = nowMs + offsetMs;
  return Math.max(
    serverNow - new Date(session.startTime).getTime() - session.pausedMs,
    0,
  );
}
