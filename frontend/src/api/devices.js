import { api } from "./client.js";

export const fetchDevices = () => api("/devices");
