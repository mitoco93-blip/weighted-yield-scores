import assert from "node:assert/strict";
import {
  getSpecialistNetRecord,
  getWeights,
  scoreSpecialistInfo,
  scoreYieldRecord,
  sumYieldRecord,
} from "../ui/scorer.js";
import { WeightedYieldConfig } from "../ui/config.js";

const definitions = [
  { YieldType: "YIELD_FOOD" },
  { YieldType: "YIELD_PRODUCTION" },
  { YieldType: "YIELD_GOLD" },
  { YieldType: "YIELD_SCIENCE" },
  { YieldType: "YIELD_CULTURE" },
  { YieldType: "YIELD_HAPPINESS" },
  { YieldType: "YIELD_DIPLOMACY" },
];

const weights = getWeights(WeightedYieldConfig.specialist);
assert.equal(weights.YIELD_DIPLOMACY, 2);
assert.equal(weights.YIELD_PRODUCTION, 1);
assert.equal(weights.YIELD_SCIENCE, 0.5);
assert.equal(weights.YIELD_CULTURE, 0.5);
assert.equal(weights.YIELD_GOLD, 2 / 7);
assert.equal(weights.YIELD_FOOD, 0.2);
assert.equal(weights.YIELD_HAPPINESS, 0.2);

assert.equal(
  scoreYieldRecord(
    { YIELD_PRODUCTION: 1 },
    WeightedYieldConfig.improvement,
    { weightAliases: { YIELD_PRODUCTION: "YIELD_GOLD" } },
  ),
  2 / 7,
);
assert.equal(
  scoreYieldRecord(
    { YIELD_FOOD: 2, YIELD_PRODUCTION: 1 },
    WeightedYieldConfig.improvement,
    { weightOverrides: { YIELD_FOOD: 1.5 } },
  ),
  4,
);

const equalBasket = {
  YIELD_DIPLOMACY: 1,
  YIELD_PRODUCTION: 2,
  YIELD_SCIENCE: 4,
  YIELD_CULTURE: 4,
  YIELD_GOLD: 7,
  YIELD_FOOD: 10,
  YIELD_HAPPINESS: 10,
};
for (const [yieldType, amount] of Object.entries(equalBasket)) {
  assert.equal(scoreYieldRecord({ [yieldType]: amount }, WeightedYieldConfig.specialist), 2);
}

const specialistInfo = {
  CurrentYields: [0, 0, 0, 0, 0, 0, 0],
  NextYields: [0, 2, 0, 4, 0, 0, 0],
  CurrentMaintenance: [0, 0, 0, 0, 0, 0, 0],
  NextMaintenance: [2, 0, 0, 0, 0, 2, 0],
};
const net = getSpecialistNetRecord(specialistInfo, definitions);
assert.deepEqual(net, {
  YIELD_FOOD: -2,
  YIELD_PRODUCTION: 2,
  YIELD_GOLD: 0,
  YIELD_SCIENCE: 4,
  YIELD_CULTURE: 0,
  YIELD_HAPPINESS: -2,
  YIELD_DIPLOMACY: 0,
});
assert.equal(scoreSpecialistInfo(specialistInfo, definitions).score, 3.2);
assert.equal(sumYieldRecord(net), 2);

const screenshotExample = {
  YIELD_PRODUCTION: 2,
  YIELD_GOLD: 2,
  YIELD_CULTURE: 2,
  YIELD_FOOD: -4,
  YIELD_HAPPINESS: -5,
};
assert.equal(sumYieldRecord(screenshotExample), -3);
assert.equal(scoreYieldRecord(screenshotExample, WeightedYieldConfig.specialist), 62 / 35);

// Regression examples taken from the in-game 0.1.3 screenshots.
assert.equal(
  scoreYieldRecord(
    { YIELD_PRODUCTION: 2, YIELD_FOOD: -1, YIELD_HAPPINESS: -2 },
    WeightedYieldConfig.specialist,
  ),
  1.4,
);
assert.equal(
  scoreYieldRecord(
    { YIELD_FOOD: 1, YIELD_PRODUCTION: 4 },
    WeightedYieldConfig.improvement,
  ),
  4.2,
);

console.log("Weighted Yield Scores scorer tests passed.");
