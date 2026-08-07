import assert from "node:assert/strict";

globalThis.GameInfo = {
  Yields: [
    { YieldType: "YIELD_FOOD", Name: "LOC_YIELD_FOOD_NAME" },
    { YieldType: "YIELD_PRODUCTION", Name: "LOC_YIELD_PRODUCTION_NAME" },
    { YieldType: "YIELD_HAPPINESS", Name: "LOC_YIELD_HAPPINESS_NAME" },
  ],
};
globalThis.Locale = {
  compose: (key) => ({
    LOC_YIELD_FOOD: "食料",
    LOC_YIELD_PRODUCTION: "生産力",
    LOC_YIELD_FOOD_NAME: "食料",
    LOC_YIELD_PRODUCTION_NAME: "生産力",
    LOC_YIELD_HAPPINESS_NAME: "幸福度",
  })[key] ?? key,
};

const { getPopulationEvaluationDetailModel } = await import(
  "../ui/population-details.js"
);

const improvement = getPopulationEvaluationDetailModel(
  {
    record: {
      YIELD_FOOD: 4,
      YIELD_PRODUCTION: 2,
    },
    contributions: {
      YIELD_FOOD: 1,
      YIELD_PRODUCTION: 2,
    },
    score: 3,
    happinessAdjustment: null,
  },
  "improvement",
  0.25,
);

assert.equal(improvement.title, "郊外配置評価");
assert.match(improvement.breakdown, /【重み付き価値（W）】/);
assert.match(improvement.breakdown, /食料 \+4 × 0\.25/);
assert.match(improvement.breakdown, /生産力 \+2/);
assert.match(improvement.breakdown, /＝ \[B\]3\[\/B\]/);
assert.match(improvement.breakdown, /※食料倍率：×0\.25/);

const specialist = getPopulationEvaluationDetailModel(
  {
    record: {
      YIELD_PRODUCTION: 2,
      YIELD_HAPPINESS: -1,
    },
    contributions: {
      YIELD_PRODUCTION: 2,
      YIELD_HAPPINESS: -0.2,
    },
    score: 2.8,
    happinessAdjustment: {
      adjustment: 1,
      happinessDelta: -1,
      beforeHappiness: -1,
      afterHappiness: -2,
      beforePenaltyRate: 0.05,
      afterPenaltyRate: 0.1,
      recoveryRate: 0.05,
      penaltyFreeWeightedOutput: 20,
    },
  },
  "specialist",
  0.2,
);

assert.equal(specialist.title, "専門家配置評価");
assert.match(specialist.breakdown, /幸福度 -1 × 0\.2/);
assert.match(specialist.breakdown, /＋ 幸福度不足補正 1/);
assert.match(specialist.breakdown, /※幸福度不足補正の内訳/);
assert.match(specialist.breakdown, /幸福度変化：-1 − 1 → -2/);
assert.match(specialist.breakdown, /産出ペナルティ：-5% → -10%（\+5pt）/);

globalThis.Locale.compose = (key) => ({
  LOC_YIELD_FOOD: "Food",
  LOC_YIELD_PRODUCTION: "Production",
  LOC_YIELD_FOOD_NAME: "Food",
  LOC_YIELD_PRODUCTION_NAME: "Production",
  LOC_YIELD_HAPPINESS_NAME: "Happiness",
})[key] ?? key;

const englishImprovement = getPopulationEvaluationDetailModel(
  {
    record: { YIELD_FOOD: 4, YIELD_PRODUCTION: 2 },
    contributions: { YIELD_FOOD: 1, YIELD_PRODUCTION: 2 },
    score: 3,
    happinessAdjustment: null,
  },
  "improvement",
  0.25,
);

assert.equal(englishImprovement.title, "Rural Placement Evaluation");
assert.match(englishImprovement.breakdown, /^\[B\]Weighted Value \(W\)\[\/B\]/);
assert.match(englishImprovement.breakdown, /Food \+4 × 0\.25 \+ Production \+2/);
assert.match(englishImprovement.breakdown, /= \[B\]3\[\/B\]/);
assert.match(englishImprovement.breakdown, /Food multiplier: ×0\.25/);
assert.doesNotMatch(englishImprovement.breakdown, /[ぁ-んァ-ヶ一-龠]/u);

console.log("population detail tests passed");
