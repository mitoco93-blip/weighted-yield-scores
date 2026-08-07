import assert from "node:assert/strict";
import {
  estimateDynamicFoodWeight,
  getBaseGrowthThreshold,
  getCandidateOutlook,
  getPreliminaryFoodWeight,
} from "../ui/food-valuation.js";

assert.equal(getBaseGrowthThreshold("AGE_ANTIQUITY", 1), 29);
assert.equal(getBaseGrowthThreshold("AGE_EXPLORATION", 1), 86);
assert.equal(getBaseGrowthThreshold("AGE_MODERN", 1), 168.5);
assert.equal(getBaseGrowthThreshold("AGE_ANTIQUITY", 10), 605);
assert.equal(getBaseGrowthThreshold("AGE_EXPLORATION", 10), 1130);
assert.equal(getBaseGrowthThreshold("AGE_MODERN", 10), 1910);

const standardWeight = getPreliminaryFoodWeight({
  age: "antiquity",
  placementPopulation: 5,
  actualThreshold: getBaseGrowthThreshold("antiquity", 5),
});
const onlineWeight = getPreliminaryFoodWeight({
  age: "antiquity",
  placementPopulation: 5,
  actualThreshold: getBaseGrowthThreshold("antiquity", 5) / 2,
});
assert.ok(onlineWeight > standardWeight, "A halved growth threshold must raise food value.");

assert.deepEqual(
  getCandidateOutlook([
    { score: 2, food: 1 },
    { score: 6, food: 3 },
    { score: 4, food: 2 },
    { score: 1, food: 10 },
  ]),
  { expectedScore: 4, expectedFood: 2, count: 3 },
);

const common = {
  age: "antiquity",
  placementPopulation: 3,
  currentFood: 20,
  foodPerTurn: 5,
  actualThreshold: getBaseGrowthThreshold("antiquity", 3),
  horizonTurns: 60,
};
const poorTiles = estimateDynamicFoodWeight({
  ...common,
  expectedCitizenScore: 1.5,
  expectedCitizenFood: 0,
});
const goodTiles = estimateDynamicFoodWeight({
  ...common,
  expectedCitizenScore: 6,
  expectedCitizenFood: 3,
});
assert.ok(goodTiles.weight > poorTiles.weight, "Better future tiles must raise food value.");

const shortGame = estimateDynamicFoodWeight({
  ...common,
  horizonTurns: 12,
  expectedCitizenScore: 4,
  expectedCitizenFood: 2,
});
const longGame = estimateDynamicFoodWeight({
  ...common,
  horizonTurns: 60,
  expectedCitizenScore: 4,
  expectedCitizenFood: 2,
});
assert.ok(longGame.weight > shortGame.weight, "More remaining turns must raise food value.");

const capped = estimateDynamicFoodWeight({
  ...common,
  actualThreshold: 0.01,
  expectedCitizenScore: 100,
  expectedCitizenFood: 100,
  maximumWeight: 3,
});
assert.equal(capped.weight, 3);

console.log("Weighted Yield Scores food valuation tests passed.");
