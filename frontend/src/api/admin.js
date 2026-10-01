import { api } from "./client.js";

export const fetchAdminCafes = () => api("/admin/cafes");

export const updateSubscription = ({ id, body }) =>
  api(`/admin/cafes/${id}/subscription`, { method: "PATCH", body });
