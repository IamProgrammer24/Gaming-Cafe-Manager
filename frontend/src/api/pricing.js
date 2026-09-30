import { api } from "./client.js";

export const fetchPricing = () => api("/pricing");
