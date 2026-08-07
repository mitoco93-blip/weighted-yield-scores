import { WeightedYieldConfig } from "./config.js";

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export function getYieldDefinitions(explicitDefinitions = undefined) {
  if (explicitDefinitions) return Array.from(explicitDefinitions);
  const definitions = globalThis.GameInfo?.Yields;
  return definitions ? Array.from(definitions) : [];
}

export function getWeights(profile, baselineYieldType = WeightedYieldConfig.baselineYieldType) {
  const directWeights = profile?.weights;
  if (directWeights) {
    return Object.fromEntries(
      Object.entries(directWeights).map(([yieldType, value]) => [
        yieldType,
        numberOrZero(value),
      ]),
    );
  }
  const amounts = profile?.equalValueAmounts ?? {};
  const baselineAmount = numberOrZero(amounts[baselineYieldType]) || 1;
  const weights = {};

  for (const [yieldType, rawAmount] of Object.entries(amounts)) {
    const amount = numberOrZero(rawAmount);
    weights[yieldType] = amount > 0 ? baselineAmount / amount : 0;
  }

  return weights;
}

export function arrayToYieldRecord(values, explicitDefinitions = undefined) {
  const definitions = getYieldDefinitions(explicitDefinitions);
  const record = {};

  for (let index = 0; index < definitions.length; index += 1) {
    const yieldType = definitions[index]?.YieldType;
    if (!yieldType) continue;
    record[yieldType] = numberOrZero(values?.[index]);
  }

  return record;
}

export function addYieldRecords(...records) {
  const result = {};
  for (const record of records) {
    for (const [yieldType, value] of Object.entries(record ?? {})) {
      result[yieldType] = numberOrZero(result[yieldType]) + numberOrZero(value);
    }
  }
  return result;
}

function resolveWeights(profile, options = undefined) {
  const weights = getWeights(profile);
  const aliases = options?.weightAliases ?? {};

  for (const [yieldType, targetYieldType] of Object.entries(aliases)) {
    if (targetYieldType in weights) {
      weights[yieldType] = numberOrZero(weights[targetYieldType]);
    }
  }

  for (const [yieldType, rawWeight] of Object.entries(options?.weightOverrides ?? {})) {
    weights[yieldType] = numberOrZero(rawWeight);
  }

  return weights;
}

export function scoreYieldRecord(record, profile, options = undefined) {
  const weights = resolveWeights(profile, options);
  let total = 0;

  for (const [yieldType, value] of Object.entries(record ?? {})) {
    total += numberOrZero(value) * numberOrZero(weights[yieldType]);
  }

  // Avoid displaying the confusing JavaScript value "-0".
  return Math.abs(total) < 1e-9 ? 0 : total;
}

export function sumYieldRecord(record) {
  let total = 0;
  for (const value of Object.values(record ?? {})) {
    total += numberOrZero(value);
  }
  return Math.abs(total) < 1e-9 ? 0 : total;
}

export function getScoreContributions(record, profile, options = undefined) {
  const weights = resolveWeights(profile, options);
  const contributions = {};
  for (const [yieldType, value] of Object.entries(record ?? {})) {
    contributions[yieldType] = numberOrZero(value) * numberOrZero(weights[yieldType]);
  }
  return contributions;
}

export function getSpecialistNetRecord(info, explicitDefinitions = undefined) {
  const definitions = getYieldDefinitions(explicitDefinitions);
  const record = {};

  for (let index = 0; index < definitions.length; index += 1) {
    const yieldType = definitions[index]?.YieldType;
    if (!yieldType) continue;

    const yieldDelta =
      numberOrZero(info?.NextYields?.[index]) -
      numberOrZero(info?.CurrentYields?.[index]);
    const maintenanceDelta =
      numberOrZero(info?.CurrentMaintenance?.[index]) -
      numberOrZero(info?.NextMaintenance?.[index]);

    record[yieldType] = yieldDelta + maintenanceDelta;
  }

  return record;
}

export function scoreSpecialistInfo(
  info,
  explicitDefinitions = undefined,
  profile = WeightedYieldConfig.specialist,
  options = undefined,
) {
  const record = getSpecialistNetRecord(info, explicitDefinitions);
  return {
    record,
    contributions: getScoreContributions(record, profile, options),
    score: scoreYieldRecord(record, profile, options),
  };
}

export function formatScore(value, decimals = 1) {
  const safeDecimals = Math.max(0, Math.min(4, Number(decimals) || 0));
  const rounded = Number(numberOrZero(value).toFixed(safeDecimals));
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeDecimals,
  });
}
