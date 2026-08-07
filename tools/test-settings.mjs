import assert from "node:assert/strict";

const storage = new Map();

storage.set("modSettings", JSON.stringify({
  "another-mod": { enabled: true },
}));
storage.set("wysWeightedYieldScoresSettings", JSON.stringify({
  scienceWeight: 2.5,
}));

globalThis.localStorage = {
  // Civ VII 1.4.1 returns the lexicographically first stored value regardless
  // of the requested key. The shared modSettings key remains readable here.
  getItem: () => storage.get([...storage.keys()].sort()[0]) ?? null,
  setItem: (key, value) => storage.set(key, value),
};

const {
  DEFAULT_SETTINGS,
  FOOD_MODE,
  WeightedYieldSettings,
  WeightedYieldSettingsStore,
} = await import("../ui/settings.js");
const { WeightedYieldConfig } = await import("../ui/config.js");
const { getWeights, scoreYieldRecord } = await import("../ui/scorer.js");

assert.equal(WeightedYieldSettings.foodMode, FOOD_MODE.DYNAMIC);
assert.equal(WeightedYieldConfig.foodValuation.enabled, true);
assert.deepEqual(WeightedYieldSettings.getWeights(), {
  YIELD_FOOD: 0.2,
  YIELD_PRODUCTION: 1,
  YIELD_GOLD: 2 / 7,
  YIELD_SCIENCE: 0.5,
  YIELD_CULTURE: 0.5,
  YIELD_HAPPINESS: 0.2,
  YIELD_DIPLOMACY: 2,
});

WeightedYieldSettings.set("scienceWeight", 0.75);
WeightedYieldSettings.set("productionWeight", 1.25);
WeightedYieldSettings.foodMode = FOOD_MODE.FIXED;

assert.equal(WeightedYieldConfig.foodValuation.enabled, false);
assert.equal(getWeights(WeightedYieldConfig.specialist).YIELD_SCIENCE, 0.75);
assert.equal(getWeights(WeightedYieldConfig.specialist).YIELD_PRODUCTION, 1.25);
assert.equal(
  scoreYieldRecord(
    { YIELD_SCIENCE: 2, YIELD_PRODUCTION: 1 },
    WeightedYieldConfig.specialist,
  ),
  2.75,
);
assert.equal(
  JSON.parse(storage.get("modSettings"))["wys-weighted-yield-scores"].scienceWeight,
  0.75,
);
assert.deepEqual(
  JSON.parse(storage.get("modSettings"))["another-mod"],
  { enabled: true },
);

const afterRestart = new WeightedYieldSettingsStore();
assert.equal(afterRestart.get("scienceWeight"), 0.75);
assert.equal(afterRestart.get("productionWeight"), 1.25);
assert.equal(afterRestart.foodMode, FOOD_MODE.FIXED);

WeightedYieldSettings.set("cultureWeight", 99);
assert.equal(WeightedYieldSettings.get("cultureWeight"), 3);
WeightedYieldSettings.set("happinessWeight", -4);
assert.equal(WeightedYieldSettings.get("happinessWeight"), 0);

WeightedYieldSettings.resetOption("scienceWeight");
assert.equal(
  WeightedYieldSettings.get("scienceWeight"),
  DEFAULT_SETTINGS.scienceWeight,
);
assert.equal(WeightedYieldSettings.get("productionWeight"), 1.25);

WeightedYieldSettings.reset();
assert.equal(WeightedYieldSettings.foodMode, FOOD_MODE.DYNAMIC);
assert.equal(WeightedYieldSettings.get("goldWeight"), DEFAULT_SETTINGS.goldWeight);
assert.equal(WeightedYieldConfig.foodValuation.enabled, true);

const afterResetRestart = new WeightedYieldSettingsStore();
assert.equal(afterResetRestart.foodMode, FOOD_MODE.DYNAMIC);
assert.equal(
  afterResetRestart.get("goldWeight"),
  DEFAULT_SETTINGS.goldWeight,
);

console.log("Weighted Yield Scores settings tests passed.");
