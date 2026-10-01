import { api } from "./client.js";
import { toQuery } from "../utils/query.js";

export const fetchBills = (params) => api(`/bills${toQuery(params)}`);

export const payBill = ({ billId, paymentMethod }) =>
  api(`/bills/${billId}/pay`, { method: "POST", body: { paymentMethod } });

export const voidBill = ({ billId, reason }) =>
  api(`/bills/${billId}/void`, { method: "POST", body: { reason } });
