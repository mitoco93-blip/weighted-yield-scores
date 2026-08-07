const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const clamp = (value, minimum, maximum) =>
  Math.min(maximum, Math.max(minimum, value));

export function getNegativeHappinessPenalty(
  happiness,
  {
    penaltyPerPoint = 0.05,
    maximumPenalty = 0.8,
  } = {},
) {
  const deficit = Math.max(0, -numberOrZero(happiness));
  return clamp(
    deficit * Math.max(0, numberOrZero(penaltyPerPoint)),
    0,
    clamp(numberOrZero(maximumPenalty), 0, 1),
  );
}

export function evaluateHappinessDeficitAdjustment({
  currentHappiness,
  happinessDelta,
  penaltyFreeWeightedOutput,
  penaltyPerPoint = 0.05,
  maximumPenalty = 0.8,
} = {}) {
  const beforeHappiness = numberOrZero(currentHappiness);
  const delta = numberOrZero(happinessDelta);
  const afterHappiness = beforeHappiness + delta;
  const penaltySettings = { penaltyPerPoint, maximumPenalty };
  const beforePenaltyRate = getNegativeHappinessPenalty(
    beforeHappiness,
    penaltySettings,
  );
  const afterPenaltyRate = getNegativeHappinessPenalty(
    afterHappiness,
    penaltySettings,
  );
  const recoveryRate = beforePenaltyRate - afterPenaltyRate;
  const weightedOutput = Math.max(0, numberOrZero(penaltyFreeWeightedOutput));
  const adjustment = weightedOutput * recoveryRate;

  return {
    beforeHappiness,
    happinessDelta: delta,
    afterHappiness,
    beforePenaltyRate,
    afterPenaltyRate,
    recoveryRate,
    penaltyFreeWeightedOutput: weightedOutput,
    adjustment: Math.abs(adjustment) < 1e-9 ? 0 : adjustment,
  };
}
