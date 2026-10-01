import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../context/ToastContext.jsx";
import { fetchAdminCafes, updateSubscription } from "../../api/admin.js";

export function useAdminCafes() {
  return useQuery({
    queryKey: ["admin", "cafes"],
    queryFn: fetchAdminCafes,
    refetchInterval: 60_000,
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "cafes"] });
      toast.success("Subscription updated");
    },
  });
}
