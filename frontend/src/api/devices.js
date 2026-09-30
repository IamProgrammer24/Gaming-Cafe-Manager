import { api } from "./client.js";

export const fetchDevices = () => api("/devices");
export const createDevice = (body) => api("/devices", { method: "POST", body });
export const bulkCreateDevices = (body) =>
  api("/devices/bulk", { method: "POST", body });
export const updateDevice = ({ id, changes }) =>
  api(`/devices/${id}`, { method: "PATCH", body: changes });
export const deleteDevice = (id) => api(`/devices/${id}`, { method: "DELETE" });
