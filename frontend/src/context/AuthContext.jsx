import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  refreshAccessToken,
  setAccessToken,
  setAuthLostHandler,
} from "../api/client.js";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from "../api/auth.js";

const AuthContext = createContext(null);

const ANONYMOUS = { status: "anonymous", user: null, cafe: null };

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState({
    status: "loading",
    user: null,
    cafe: null,
  });

  const clear = useCallback(() => {
    setAccessToken(null);
    queryClient.clear(); // never keep one user's data around for the next login
    setState(ANONYMOUS);
  }, [queryClient]);

  // On every page load: try to restore the session from the refresh cookie.
  useEffect(() => {
    setAuthLostHandler(clear);
    let cancelled = false;

    (async () => {
      try {
        await refreshAccessToken();
        const { user, cafe } = await meRequest();
        if (!cancelled) setState({ status: "authenticated", user, cafe });
      } catch {
        if (!cancelled) setState(ANONYMOUS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clear]);

  const applySession = useCallback(({ user, cafe, accessToken }) => {
    setAccessToken(accessToken);
    setState({ status: "authenticated", user, cafe });
  }, []);

  const login = useCallback(
    async (credentials) => applySession(await loginRequest(credentials)),
    [applySession],
  );
  const register = useCallback(
    async (data) => applySession(await registerRequest(data)),
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      /* clear locally even if the server can't be reached */
    }
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
