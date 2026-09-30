import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../context/ToastContext.jsx";
import { fetchCafe, updateCafe } from "../../api/cafe.js";
import {
  bulkCreateDevices,
  createDevice,
  deleteDevice,
  fetchDevices,
  updateDevice,
} from "../../api/devices.js";
import { fetchPricing, savePricing } from "../../api/pricing.js";

export const useCafe = () =>
  useQuery({ queryKey: ["cafe"], queryFn: fetchCafe });
export const useDevices = () =>
  useQuery({ queryKey: ["devices"], queryFn: fetchDevices });
export const usePricing = () =>
  useQuery({ queryKey: ["pricing"], queryFn: fetchPricing });

export function useUpdateCafe() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: updateCafe,
    onSuccess: (data) => {
      qc.setQueryData(["cafe"], data); // the header shows the new name straight away
      toast.success("Café details saved");
    },
  });
}

function useDeviceMutation(mutationFn, successMessage) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      toast.success(
        typeof successMessage === "function"
          ? successMessage(data)
          : successMessage,
      );
    },
  });
}

export const useCreateDevice = () =>
  useDeviceMutation(createDevice, "Device added");
export const useBulkCreateDevices = () =>
  useDeviceMutation(
    bulkCreateDevices,
    (d) => `${d.devices.length} devices added`,
  );
export const useUpdateDevice = () =>
  useDeviceMutation(updateDevice, "Device updated");
export const useDeleteDevice = () =>
  useDeviceMutation(deleteDevice, "Device removed");

export function useSavePricing() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: savePricing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing"] });
      toast.success("Pricing saved");
    },
  });
}
