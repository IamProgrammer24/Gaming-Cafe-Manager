import { api } from "./client.js";

export const fetchCafe = () => api("/cafe");
export const updateCafe = (body) => api("/cafe", { method: "PATCH", body });
