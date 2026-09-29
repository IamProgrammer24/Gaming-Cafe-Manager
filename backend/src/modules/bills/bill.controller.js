import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  listBills,
  getOneBill,
  markPaid,
  voidBill,
  toPublicBill,
} from "./bill.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, ...pagination } = await listBills(
    req.cafeId,
    req.validatedQuery,
  );
  res.json({
    success: true,
    data: { bills: items.map(toPublicBill), ...pagination },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const bill = await getOneBill(req.cafeId, req.params.id);
  res.json({ success: true, data: { bill: toPublicBill(bill) } });
});

export const pay = asyncHandler(async (req, res) => {
  const bill = await markPaid(
    req.cafeId,
    req.params.id,
    req.user.id,
    req.body.paymentMethod,
  );
  res.json({ success: true, data: { bill: toPublicBill(bill) } });
});

export const voidIt = asyncHandler(async (req, res) => {
  const bill = await voidBill(
    req.cafeId,
    req.params.id,
    req.user.id,
    req.body.reason,
  );
  res.json({ success: true, data: { bill: toPublicBill(bill) } });
});
