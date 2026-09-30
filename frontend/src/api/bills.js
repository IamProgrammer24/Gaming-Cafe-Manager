import { api } from "./client.js";

export const payBill = ({ billId, paymentMethod }) =>
  api(`/bills/${billId}/pay`, { method: "POST", body: { paymentMethod } });
