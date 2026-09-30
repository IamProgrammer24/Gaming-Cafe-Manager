import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

// If any request is refused because the subscription ended, re-check the café
// so the app switches to the renewal screen straight away.
function onGlobalError(err) {
  if (err?.code === "SUBSCRIPTION_EXPIRED") {
    queryClient.invalidateQueries({ queryKey: ["cafe"] });
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onGlobalError }),
  mutationCache: new MutationCache({ onError: onGlobalError }),
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // Don't retry client errors (400, 401, 403...), only network/server problems
      retry: (count, err) =>
        !(err?.status >= 400 && err?.status < 500) && count < 2,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
