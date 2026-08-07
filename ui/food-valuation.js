const CURVES = {
  antiquity: { flat: 5, scalar: 20, quadratic: 4 },
  exploration: { flat: 30, scalar: 50, quadratic: 6 },
  modern: { flat: 60, scalar: 100, quadratic: 8.5 },
};

const MODERN_ENDGAME_THRESHOLD = 7872.5;

const finite = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, finite(value, minimum)));

export function normalizeAge(age) {
  const text = String(age ?? "").toLowerCase();
  if (text.includes("antiquity")) return "antiquity";
  if (text.includes("exploration")) return "exploration";
  return "modern";
}

// Civ VII 1.4.x: Flat + Scalar * population + Quadratic * population^2.
export function getBaseGrowthThreshold(age, placementPopulation) {
  const curve = CURVES[normalizeAge(age)];
  const population = Math.max(1, Math.floor(finite(placementPopulation, 1)));
  return curve.flat + curve.scalar * population + curve.quadratic * population ** 2;
}

export function getPreliminaryFoodWeight({
  age,
  placementPopulation,
  actualThreshold,
  minimumWeight = 0.15,
  maximumWeight = 3,
} = {}) {
  const fallbackThreshold = getBaseGrowthThreshold(age, placementPopulation);
  const threshold = finite(actualThreshold) > 0 ? finite(actualThreshold) : fallbackThreshold;
  return clamp(
    0.2 * Math.sqrt(MODERN_ENDGAME_THRESHOLD / threshold),
    minimumWeight,
    maximumWeight,
  );
}

export function getCandidateOutlook(candidates, count = 3) {
  const ranked = Array.from(candidates ?? [])
    .filter((candidate) => Number.isFinite(Number(candidate?.score)))
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, Math.max(1, Math.floor(finite(count, 3))));

  if (!ranked.length) return { expectedScore: 3, expectedFood: 0, count: 0 };
  return {
    expectedScore:
      ranked.reduce((sum, candidate) => sum + Math.max(0, finite(candidate.score)), 0) /
      ranked.length,
    expectedFood:
      ranked.reduce(
        (sum, candidate) => sum + Math.max(0, finite(candidate.food)),
        0,
      ) / ranked.length,
    count: ranked.length,
  };
}

function simulateGrowth({
  age,
  placementPopulation,
  currentFood,
  foodPerTurn,
  actualThreshold,
  growthAdjustment,
  expectedCitizenScore,
  expectedCitizenFood,
  horizonTurns,
  maximumGrowths,
}) {
  let stock = Math.max(0, finite(currentFood));
  let growths = 0;
  let output = 0;
  let threshold = Math.max(1, finite(actualThreshold, 1));

  for (let turn = 0; turn < horizonTurns; turn += 1) {
    const rate = Math.max(
      0,
      finite(foodPerTurn) + growths * Math.max(0, finite(expectedCitizenFood)),
    );
    stock += rate;

    while (growths < maximumGrowths && stock >= threshold) {
      stock -= threshold;
      growths += 1;
      threshold = Math.max(
        1,
        getBaseGrowthThreshold(age, placementPopulation + growths) * growthAdjustment,
      );
    }
    output += growths * Math.max(0, finite(expectedCitizenScore));
  }

  // A short horizon should not make progress just below a threshold worthless.
  const progress = growths < maximumGrowths ? clamp(stock / threshold, 0, 1) : 0;
  const terminalTurns = Math.min(15, horizonTurns / 2);
  output += progress * Math.max(0, finite(expectedCitizenScore)) * terminalTurns;
  return output;
}

export function estimateDynamicFoodWeight({
  age,
  placementPopulation,
  currentFood,
  foodPerTurn,
  actualThreshold,
  horizonTurns = 60,
  expectedCitizenScore = 3,
  expectedCitizenFood = 0,
  maximumGrowths = 3,
  minimumWeight = 0.15,
  maximumWeight = 3,
} = {}) {
  const population = Math.max(1, Math.floor(finite(placementPopulation, 1)));
  const horizon = Math.max(1, Math.min(60, Math.floor(finite(horizonTurns, 60))));
  const baseThreshold = getBaseGrowthThreshold(age, population);
  const threshold = finite(actualThreshold) > 0 ? finite(actualThreshold) : baseThreshold;
  const growthAdjustment = clamp(threshold / baseThreshold, 0.05, 20);
  const preliminary = getPreliminaryFoodWeight({
    age,
    placementPopulation: population,
    actualThreshold: threshold,
    minimumWeight,
    maximumWeight,
  });

  const baselineOutput = simulateGrowth({
    age,
    placementPopulation: population,
    currentFood,
    foodPerTurn,
    actualThreshold: threshold,
    growthAdjustment,
    expectedCitizenScore,
    expectedCitizenFood,
    horizonTurns: horizon,
    maximumGrowths,
  });
  const extraFoodOutput = simulateGrowth({
    age,
    placementPopulation: population,
    currentFood,
    foodPerTurn: finite(foodPerTurn) + 1,
    actualThreshold: threshold,
    growthAdjustment,
    expectedCitizenScore,
    expectedCitizenFood,
    horizonTurns: horizon,
    maximumGrowths,
  });
  const simulatedMarginal = Math.max(0, extraFoodOutput - baselineOutput) / horizon;

  // The curve supplies a stable prior; local tile quality, remaining time and
  // the bounded growth simulation make it settlement-specific without an
  // unstable recursive search over every possible future border expansion.
  const localFactor = clamp(
    Math.sqrt(Math.max(0.1, finite(expectedCitizenScore, 3)) / 3),
    0.7,
    1.5,
  );
  const horizonFactor = clamp(Math.sqrt(horizon / 60), 0.5, 1);
  const prior = preliminary * localFactor * horizonFactor;
  const weight = 0.75 * prior + 0.25 * simulatedMarginal;

  return {
    weight: clamp(weight, minimumWeight, maximumWeight),
    preliminaryWeight: preliminary,
    simulatedMarginal,
    placementPopulation: population,
    horizonTurns: horizon,
    growthAdjustment,
    expectedCitizenScore: Math.max(0, finite(expectedCitizenScore)),
    expectedCitizenFood: Math.max(0, finite(expectedCitizenFood)),
  };
}
