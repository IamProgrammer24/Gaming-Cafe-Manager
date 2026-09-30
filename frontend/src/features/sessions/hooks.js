import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../context/ToastContext.jsx";
import {
  fetchActiveSessions,
  pauseSession,
  resumeSession,
  startSession,
  stopSession,
} from "../../api/sessions.js";
import { payBill } from "../../api/bills.js";

export const ACTIVE_KEY = ["sessions", "active"];

export function useActiveSessions() {
  return useQuery({
    queryKey: ACTIVE_KEY,
    queryFn: fetchActiveSessions,
    refetchInterval: 5000, // pauses automatically while the tab is hidden
    staleTime: 2000,
  });
}

export function sessionErrorMessage(err) {
  if (err.code === "INVALID_TRANSITION" || err.code === "SESSION_CONFLICT") {
    return "This session was just changed by someone else. The board has been refreshed.";
  }
  return err.message;
}

// Shows the result instantly, before the next poll confirms it.
function putSessionInCache(qc, session, serverTime) {
  qc.setQueryData(ACTIVE_KEY, (old) => {
    if (!old) return old;
    const others = old.sessions.filter((s) => s.id !== session.id);
    return {
      offsetMs: Date.parse(serverTime) - Date.now(),
      sessions: session.status === "ended" ? others : [...others, session],
    };
  });
}

function useSessionMutation(mutationFn, { toastErrors = true } = {}) {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      putSessionInCache(qc, data.session, data.serverTime);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
    onError: (err) => {
      if (toastErrors) toast.error(sessionErrorMessage(err));
      qc.invalidateQueries({ queryKey: ["sessions"] }); // resync: someone else may have acted
    },
  });
}

// Dialogs show their own errors inline, so they don't toast.
export const useStartSession = () =>
  useSessionMutation(startSession, { toastErrors: false });
export const useStopSession = () =>
  useSessionMutation(stopSession, { toastErrors: false });
export const usePauseSession = () => useSessionMutation(pauseSession);
export const useResumeSession = () => useSessionMutation(resumeSession);

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payBill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
