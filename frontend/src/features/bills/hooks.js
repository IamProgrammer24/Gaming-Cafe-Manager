import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../../context/ToastContext.jsx";
import { fetchBills, voidBill } from "../../api/bills.js";

export function useBills(params, enabled = true) {
  return useQuery({
    queryKey: ["bills", params],
    queryFn: () => fetchBills(params),
    placeholderData: keepPreviousData, // keeps the old page visible while the next one loads
    enabled,
  });
}

export function useVoidBill() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: voidBill,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Bill voided");
    },
  });
}

export function billErrorMessage(err) {
  if (
    ["ALREADY_PAID", "ALREADY_VOIDED", "BILL_VOIDED", "BILL_CONFLICT"].includes(
      err.code,
    )
  ) {
    return "This bill was just changed by someone else. The list has been refreshed.";
  }
  return err.message;
}
