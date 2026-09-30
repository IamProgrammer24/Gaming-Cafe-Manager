import { api } from "./client.js";

export const fetchPricing = () => api("/pricing");
export const savePricing = ({ deviceType, ...body }) =>
  api(`/pricing/${deviceType}`, { method: "PUT", body });
