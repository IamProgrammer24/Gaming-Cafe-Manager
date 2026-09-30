import { api } from "./client.js";

// offsetMs = server clock minus this device's clock, measured when the data arrived
export async function fetchActiveSessions() {
  const data = await api("/sessions/active");
  return {
    sessions: data.sessions,
    offsetMs: Date.parse(data.serverTime) - Date.now(),
  };
}

export const startSession = (body) =>
  api("/sessions/start", { method: "POST", body });
export const pauseSession = (id) =>
  api(`/sessions/${id}/pause`, { method: "POST" });
export const resumeSession = (id) =>
  api(`/sessions/${id}/resume`, { method: "POST" });
export const stopSession = (id) =>
  api(`/sessions/${id}/stop`, { method: "POST" });
