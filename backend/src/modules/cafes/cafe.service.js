import { AppError } from "../../utils/AppError.js";
import { Cafe } from "./cafe.model.js";

export async function getCafe(cafeId) {
  const cafe = await Cafe.findById(cafeId);
  if (!cafe) throw new AppError("Café not found", 404, "CAFE_NOT_FOUND");
  return cafe;
}

export async function updateCafe(cafeId, data) {
  const update = {};
  for (const key of ["name", "address", "phone"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.roundUpBills !== undefined) update.roundUpBills = data.roundUpBills;
  if (data.openingHours?.open)
    update["openingHours.open"] = data.openingHours.open;
  if (data.openingHours?.close)
    update["openingHours.close"] = data.openingHours.close;

  const cafe = await Cafe.findByIdAndUpdate(
    cafeId,
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!cafe) throw new AppError("Café not found", 404, "CAFE_NOT_FOUND");
  return cafe;
}
