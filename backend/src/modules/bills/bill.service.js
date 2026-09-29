import { AppError } from "../../utils/AppError.js";
import { formatPaise } from "../../utils/money.js";
import { Session } from "../sessions/session.model.js";
import { Bill } from "./bill.model.js";

// RULE: every function takes cafeId first and every query filters by it.

export const toPublicBill = (b) => ({
  id: b._id,
  sessionId: b.sessionId,
  deviceName: b.deviceName,
  deviceType: b.deviceType,
  customerName: b.customerName,
  startTime: b.startTime,
  endTime: b.endTime,
  billedMinutes: b.billedMinutes,
  amount: b.amount,
  formattedAmount: formatPaise(b.amount),
  paymentStatus: b.paymentStatus,
  paymentMethod: b.paymentMethod,
  paidAt: b.paidAt,
  voided: b.voided,
  voidReason: b.voidReason,
  voidedAt: b.voidedAt,
});

const conflict = () =>
  new AppError(
    "This bill was just changed by someone else. Refresh and try again.",
    409,
    "BILL_CONFLICT",
  );

// Safe to call more than once for the same session: it never makes a second bill.
export async function createBillForSession(
  session,
  { paymentMethod, userId } = {},
) {
  const fields = {
    deviceName: session.deviceName,
    deviceType: session.deviceType,
    customerName: session.customerName,
    startTime: session.startTime,
    endTime: session.endTime,
    billedMinutes: session.billedMinutes,
    amount: session.amount,
    ...(paymentMethod && {
      paymentStatus: "paid",
      paymentMethod,
      paidAt: session.endTime,
      paidBy: userId,
    }),
  };

  const key = { cafeId: session.cafeId, sessionId: session._id };
  let bill;
  try {
    bill = await Bill.findOneAndUpdate(
      key,
      { $setOnInsert: fields },
      { new: true, upsert: true },
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
    bill = await Bill.findOne(key); // another request created it a moment ago
  }

  await Session.updateOne(
    { _id: session._id, cafeId: session.cafeId },
    { $set: { billed: true } },
  );
  return bill;
}

// Safety net: creates bills for any ended session that has none.
export async function backfillMissingBills(cafeId) {
  const missing = await Session.find({
    cafeId,
    status: "ended",
    billed: { $ne: true },
  }).limit(100);
  for (const s of missing) await createBillForSession(s);
}

async function getBill(cafeId, id) {
  const bill = await Bill.findOne({ _id: id, cafeId });
  if (!bill) throw new AppError("Bill not found", 404, "BILL_NOT_FOUND");
  return bill;
}

export const getOneBill = (cafeId, id) => getBill(cafeId, id);

export async function listBills(
  cafeId,
  { paymentStatus, paymentMethod, voided, from, to, page, limit },
) {
  try {
    await backfillMissingBills(cafeId);
  } catch (err) {
    console.error("Bill backfill failed:", err);
  }

  const filter = { cafeId };
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (voided !== undefined) filter.voided = voided;
  if (from || to) {
    filter.endTime = {};
    if (from) filter.endTime.$gte = from;
    if (to) filter.endTime.$lte = to;
  }

  const [items, total] = await Promise.all([
    Bill.find(filter)
      .sort({ endTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Bill.countDocuments(filter),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function markPaid(cafeId, id, userId, paymentMethod) {
  const bill = await getBill(cafeId, id);
  if (bill.voided)
    throw new AppError("This bill was voided", 409, "BILL_VOIDED");
  if (bill.paymentStatus === "paid")
    throw new AppError("This bill is already paid", 409, "ALREADY_PAID");

  const updated = await Bill.findOneAndUpdate(
    { _id: id, cafeId, voided: false, paymentStatus: "unpaid" },
    {
      $set: {
        paymentStatus: "paid",
        paymentMethod,
        paidAt: new Date(),
        paidBy: userId,
      },
    },
    { new: true },
  );
  if (!updated) throw conflict();
  return updated;
}

export async function voidBill(cafeId, id, userId, reason) {
  const bill = await getBill(cafeId, id);
  if (bill.voided)
    throw new AppError("This bill is already voided", 409, "ALREADY_VOIDED");

  const updated = await Bill.findOneAndUpdate(
    { _id: id, cafeId, voided: false },
    {
      $set: {
        voided: true,
        voidReason: reason,
        voidedAt: new Date(),
        voidedBy: userId,
      },
    },
    { new: true },
  );
  if (!updated) throw conflict();
  return updated;
}
