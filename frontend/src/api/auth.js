import { api } from "./client.js";

export const loginRequest = (body) =>
  api("/auth/login", { method: "POST", body, auth: false });
export const registerRequest = (body) =>
  api("/auth/register", { method: "POST", body, auth: false });
export const logoutRequest = () =>
  api("/auth/logout", { method: "POST", auth: false });
export const meRequest = () => api("/auth/me");
