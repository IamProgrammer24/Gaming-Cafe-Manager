import { AppError } from "../../utils/AppError.js";
import { PricingRule } from "./pricing.model.js";
import { ratesForPlayers } from "../../utils/cost.js";

export const toPublicRule = (r) => ({
  id: r._id,
  deviceType: r.deviceType,
  ratePerHour: r.ratePerHour,
  weekendRatePerHour: r.weekendRatePerHour,
  billingUnit: r.billingUnit,
  minCharge: r.minCharge,
  groupRates: [...(r.groupRates ?? [])]
    .map((g) => ({
      players: g.players,
      ratePerHour: g.ratePerHour,
      weekendRatePerHour: g.weekendRatePerHour ?? null,
    }))
    .sort((a, b) => a.players - b.players),
});

export const listPricing = (cafeId) =>
  PricingRule.find({ cafeId }).sort({ deviceType: 1 });

export const setPricing = (cafeId, deviceType, data) =>
  PricingRule.findOneAndUpdate(
    { cafeId, deviceType },
    { $set: data },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

// Used by the sessions module in Step 5.
export async function getRuleForDeviceType(cafeId, deviceType) {
  const rule = await PricingRule.findOne({ cafeId, deviceType }).lean();
  if (!rule) {
    throw new AppError(
      `Set a price for ${deviceType} devices first`,
      422,
      "PRICING_NOT_SET",
    );
  }
  return rule;
}

// Refuses a group size the café has not priced.
export function assertPlayersPriced(rule, players) {
  if (!ratesForPlayers(rule, players)) {
    throw new AppError(
      `No price is set for ${players} player${players === 1 ? "" : "s"}`,
      422,
      "PLAYERS_NOT_PRICED",
    );
  }
}
