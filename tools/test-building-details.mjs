import assert from "node:assert/strict";
import {
  getBuildingEvaluationDetailModel,
  getBuildingListScoreLabel,
  getBuildingListScoreParts,
} from "../ui/building-details.js";

const yieldDefinitions = Object.assign([
  { YieldType: "YIELD_PRODUCTION", Name: "LOC_YIELD_PRODUCTION" },
  { YieldType: "YIELD_GOLD", Name: "LOC_YIELD_GOLD" },
  { YieldType: "YIELD_FOOD", Name: "LOC_YIELD_FOOD" },
  { YieldType: "YIELD_HAPPINESS", Name: "LOC_YIELD_HAPPINESS" },
], {
  lookup(yieldType) {
    return this.find((entry) => entry.YieldType === yieldType);
  },
});

const localized = {
  LOC_YIELD_FOOD: "[icon:YIELD_FOOD] 食料",
  LOC_YIELD_PRODUCTION: "[icon:YIELD_PRODUCTION] 生産力",
  LOC_YIELD_GOLD: "[icon:YIELD_GOLD] ゴールド",
  LOC_YIELD_FOOD: "[icon:YIELD_FOOD] 食料",
  LOC_YIELD_HAPPINESS: "[icon:YIELD_HAPPINESS] 幸福度",
  LOC_IMPROVEMENT_FARM: "農場",
};

globalThis.GameInfo = { Yields: yieldDefinitions };
globalThis.Locale = {
  compose: (key) => localized[key] ?? key,
};

const standardEvaluation = {
  correctedRecord: {
    YIELD_PRODUCTION: 3,
    YIELD_FOOD: 2,
    YIELD_HAPPINESS: 5,
  },
  correctedContributions: {
    YIELD_PRODUCTION: 3,
    YIELD_FOOD: 0.498,
    YIELD_HAPPINESS: 1,
  },
  score: 4.498,
  productionCost: 175,
  priority: 257,
  ruralReplacement: false,
};
const standard = getBuildingEvaluationDetailModel(standardEvaluation);

assert.match(
  standard.breakdown,
  /\[icon:YIELD_PRODUCTION\] 生産力 \+3 ＋ \[icon:YIELD_FOOD\] 食料 \+2 × 0\.249 ＋ \[icon:YIELD_HAPPINESS\] 幸福度 \+5 × 0\.2/,
  "yield terms must stay in one readable equation and retain icon markup",
);
assert.equal(getBuildingListScoreLabel(standardEvaluation), "W4.5｜E257");
assert.deepEqual(getBuildingListScoreParts(standardEvaluation), {
  weightedValue: "4.5",
  efficiency: "257",
});
assert.match(
  standard.breakdown,
  /^\[B\]【重み付き価値（W）】\[\/B\]/,
);
assert.match(
  standard.breakdown,
  /＝ \[B\]4\.5\[\/B\]\n\[B\]【効率（E）】\[\/B\]\n4\.5 ÷ 175 \[icon:YIELD_PRODUCTION\] × 10,000 ＝ \[B\]257\[\/B\]/,
  "only the final values must be bold and the production icon needs spacing",
);
assert.doesNotMatch(standard.breakdown, /\n\n/);

const relocatedEvaluation = {
  buildingRecord: {
    YIELD_PRODUCTION: -1,
    YIELD_HAPPINESS: -1,
  },
  buildingContributions: {
    YIELD_PRODUCTION: -1,
    YIELD_HAPPINESS: -0.2,
  },
  relocation: {
    kind: "improvement",
    record: {
      YIELD_FOOD: 4,
      YIELD_GOLD: 3,
    },
    scored: {
      constructible: { Name: "LOC_IMPROVEMENT_FARM" },
    },
  },
  relocationContributions: {
    YIELD_FOOD: 1,
    YIELD_GOLD: 0.858,
  },
  ruralReplacement: true,
  score: 0.658,
  productionCost: 535,
  priority: 12,
};
const relocated = getBuildingEvaluationDetailModel(relocatedEvaluation);

assert.match(
  relocated.breakdown,
  /＋ 再配置産出（\[icon:YIELD_GOLD\] ゴールド \+3 × 0\.286 ＋ \[icon:YIELD_FOOD\] 食料 \+4 × 0\.25）/,
);
assert.equal(relocated.destination, "※再配置先：郊外（農場）");
assert.equal(getBuildingListScoreLabel(relocatedEvaluation), "W0.66｜E12");

const recoveredEvaluation = {
  correctedRecord: { YIELD_HAPPINESS: 2.5 },
  correctedContributions: { YIELD_HAPPINESS: 0.5 },
  score: 16.11,
  productionCost: 535,
  priority: 301,
  ruralReplacement: false,
  happinessAdjustment: {
    beforeHappiness: -3.16,
    happinessDelta: 2.5,
    afterHappiness: -0.66,
    beforePenaltyRate: 0.1582,
    afterPenaltyRate: 0.0332,
    recoveryRate: 0.125,
    penaltyFreeWeightedOutput: 124.51,
    adjustment: 15.56,
  },
};
const recovered = getBuildingEvaluationDetailModel(recoveredEvaluation);

assert.match(recovered.breakdown, /＋ 幸福度不足補正 15\.56/);
assert.doesNotMatch(
  recovered.breakdown,
  /幸福度不足補正 \+15\.56/,
  "positive adjustment must not repeat a plus sign after its label",
);
assert.match(
  recovered.breakdown,
  /幸福度変化：-3\.16 ＋ 2\.5 → -0\.66/,
);
assert.match(
  recovered.breakdown,
  /産出ペナルティ：-15\.82% → -3\.32%（\+12\.5pt）/,
);
assert.match(
  recovered.breakdown,
  /幸福度不足補正値：ペナルティ前の重み付き産出 124\.51 × 12\.5% ＝ 15\.56/,
);
assert.equal(getBuildingListScoreLabel(recoveredEvaluation), "W16.11｜E301");

const unhappyEvaluation = {
  correctedRecord: { YIELD_HAPPINESS: -2 },
  correctedContributions: { YIELD_HAPPINESS: -0.4 },
  score: -4.4,
  productionCost: 100,
  priority: -440,
  ruralReplacement: false,
  happinessAdjustment: {
    beforeHappiness: -1,
    happinessDelta: -2,
    afterHappiness: -3,
    beforePenaltyRate: 0.05,
    afterPenaltyRate: 0.15,
    recoveryRate: -0.1,
    penaltyFreeWeightedOutput: 40,
    adjustment: -4,
  },
};
const unhappy = getBuildingEvaluationDetailModel(unhappyEvaluation);

assert.match(unhappy.breakdown, /− 幸福度不足補正 4/);
assert.match(
  unhappy.breakdown,
  /産出ペナルティ：-5% → -15%（-10pt）/,
);
assert.match(
  unhappy.breakdown,
  /幸福度不足補正値：ペナルティ前の重み付き産出 40 × -10% ＝ -4/,
);
assert.equal(getBuildingListScoreLabel(unhappyEvaluation), "W-4.4｜E-440");

globalThis.Locale.compose = (key) => ({
  LOC_YIELD_FOOD: "[icon:YIELD_FOOD] Food",
  LOC_YIELD_PRODUCTION: "[icon:YIELD_PRODUCTION] Production",
  LOC_YIELD_GOLD: "[icon:YIELD_GOLD] Gold",
  LOC_YIELD_HAPPINESS: "[icon:YIELD_HAPPINESS] Happiness",
  LOC_IMPROVEMENT_FARM: "Farm",
})[key] ?? key;

const englishStandard = getBuildingEvaluationDetailModel(standardEvaluation);
assert.equal(englishStandard.title, "Building Evaluation");
assert.match(englishStandard.breakdown, /^\[B\]Weighted Value \(W\)\[\/B\]/);
assert.match(englishStandard.breakdown, /\[B\]Efficiency \(E\)\[\/B\]/);
assert.match(
  englishStandard.breakdown,
  /4\.5 ÷ 175 \[icon:YIELD_PRODUCTION\] × 10,000 = \[B\]257\[\/B\]/,
);

const englishRelocated = getBuildingEvaluationDetailModel(relocatedEvaluation);
assert.match(englishRelocated.breakdown, /\+ Relocation yields \(/);
assert.equal(englishRelocated.destination, "Relocation destination: Rural (Farm)");

const englishRecovered = getBuildingEvaluationDetailModel(recoveredEvaluation);
assert.match(
  englishRecovered.breakdown,
  /Yield penalty: -15\.82% → -3\.32% \(\+12\.5pp\)/,
);
assert.doesNotMatch(englishRecovered.breakdown, /[ぁ-んァ-ヶ一-龠]/u);

console.log("building detail tests passed.");
