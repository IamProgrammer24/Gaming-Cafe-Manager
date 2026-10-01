// { from: '2026-10-01', page: 2, x: undefined } -> "?from=2026-10-01&page=2"
export function toQuery(params = {}) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "")
      q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
