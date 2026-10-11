import { applyOverbuildCost } from "./overbuild-cost.js";
// Keep acquisition costs independent of configurable recurring-yield weights.
// Gold uses the existing production-equivalent conversion: 1 gold = 2/7 production.
export const GOLD_TO_PRODUCTION = 2 / 7;

const validCost = value => {
  if (value == null || value === '' || typeof value === 'boolean') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export function getBuildingCost({city, constructible, item, isPurchasing = false, operationArguments, placement, isRepairing = false} = {}) {
  const productionCost = validCost(item?.productionCost) ?? validCost(
    city?.Production?.getConstructibleProductionCost?.(constructible?.$hash),
  );
  if (!isPurchasing) return applyOverbuildCost({productionCost, isPurchasing: false, efficiencyCost: productionCost},
    {city,constructible,placement,isRepairing:isRepairing || Boolean(item?.repairDamaged) || Boolean(operationArguments?.RepairDamaged)});

  // The chooser's cost is the game's command result, including discounts and repairs.
  // For a placement, query the same PURCHASE command with the selected plot arguments.
  let purchaseCost = validCost(item?.cost);
  if (purchaseCost === null && globalThis.CityCommandTypes?.PURCHASE != null) {
    try {
      const args = {...(operationArguments ?? {}), ConstructibleType: constructible.$hash};
      const result = globalThis.Game?.CityCommands?.canStart?.(
        city.id, globalThis.CityCommandTypes.PURCHASE, args, false,
      );
      purchaseCost = validCost(result?.Cost);
    } catch { /* Fall back to the same gold API used by the native chooser. */ }
  }
  if (purchaseCost === null && globalThis.YieldTypes?.YIELD_GOLD != null) {
    purchaseCost = validCost(city?.Gold?.getBuildingPurchaseCost?.(
      globalThis.YieldTypes.YIELD_GOLD, constructible.ConstructibleType,
    ));
  }
  return {
    productionCost, purchaseCost, isPurchasing: true,
    efficiencyCost: purchaseCost === null ? null : purchaseCost * GOLD_TO_PRODUCTION,
  };
}
