import { api } from "./client.js";

export const fetchDashboardReport = () => api("/reports/dashboard");
