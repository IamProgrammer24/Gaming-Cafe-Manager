export const TRANSITIONS = {
  running: ["paused", "ended"],
  paused: ["running", "ended"],
  ended: [],
};

export const canTransition = (from, to) =>
  (TRANSITIONS[from] || []).includes(to);

const ms = (d) => new Date(d).getTime();

// Total paused time, including a pause that is still in progress.
export function getFinalPausedMs(session, now = new Date()) {
  if (session.status === "paused" && session.pausedAt) {
    return session.pausedMs + Math.max(now.getTime() - ms(session.pausedAt), 0);
  }
  return session.pausedMs;
}

// Time that counts toward the bill. Frozen while paused and after the end.
export function getElapsedMs(session, now = new Date()) {
  const start = ms(session.startTime);
  let reference;
  if (session.status === "ended") reference = ms(session.endTime);
  else if (session.status === "paused") reference = ms(session.pausedAt);
  else reference = now.getTime();

  return Math.max(reference - start - session.pausedMs, 0);
}
