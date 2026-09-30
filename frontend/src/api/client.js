const BASE = import.meta.env.VITE_API_URL || "/api/v1";

let accessToken = null; // memory only, never localStorage
let onAuthLost = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};
export const setAuthLostHandler = (fn) => {
  onAuthLost = fn;
};

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// { email: "Invalid email address", ... } from the server's validation details
export function fieldErrorsFrom(err) {
  if (!Array.isArray(err?.details)) return {};
  return Object.fromEntries(
    err.details.filter((d) => d && d.field).map((d) => [d.field, d.message]),
  );
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function rawRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      credentials: "include", // sends the refresh cookie
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Check your internet connection.",
      0,
      "NETWORK_ERROR",
    );
  }

  const json = await parseJson(res);
  if (!res.ok) {
    const e = json?.error;
    const fallback =
      res.status >= 500
        ? "The server is not responding. Please try again in a moment."
        : `Request failed (${res.status})`;
    throw new ApiError(
      e?.message || fallback,
      res.status,
      e?.code || "UNKNOWN",
      e?.details,
    );
  }
  return json?.data ?? null;
}

// If several requests find the token expired at once, only one refresh call is made.
let refreshing = null;
export function refreshAccessToken() {
  if (!refreshing) {
    refreshing = rawRequest("/auth/refresh", { method: "POST", auth: false })
      .then((data) => {
        accessToken = data.accessToken;
        return accessToken;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

// Use this for every API call. On a 401 it refreshes the token once and retries.
export async function api(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (err.status !== 401 || options.auth === false) throw err;

    try {
      await refreshAccessToken();
    } catch (refreshErr) {
      if (refreshErr.status === 401) {
        accessToken = null;
        onAuthLost(); // session is really over: send the user to login
        throw err;
      }
      throw refreshErr; // e.g. network error: keep the user logged in
    }
    return rawRequest(path, options); // one retry with the new token
  }
}
