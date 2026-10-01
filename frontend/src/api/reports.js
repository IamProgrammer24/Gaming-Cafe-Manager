import { api, apiDownload } from "./client.js";
import { toQuery } from "../utils/query.js";

export const fetchDashboardReport = () => api("/reports/dashboard");
export const fetchDailyReport = ({ from, to }) =>
  api(`/reports/daily${toQuery({ from, to })}`);
export const fetchBreakdownReport = ({ from, to }) =>
  api(`/reports/breakdown${toQuery({ from, to })}`);
export const fetchMonthlyReport = (year) =>
  api(`/reports/monthly${toQuery({ year })}`);
export const downloadBillsCsv = ({ from, to }) =>
  apiDownload(`/reports/export.csv${toQuery({ from, to })}`);
