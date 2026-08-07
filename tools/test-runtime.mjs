import assert from "node:assert/strict";

const yieldTypes = [
  "YIELD_FOOD",
  "YIELD_PRODUCTION",
  "YIELD_GOLD",
  "YIELD_SCIENCE",
  "YIELD_CULTURE",
  "YIELD_HAPPINESS",
  "YIELD_DIPLOMACY",
];

globalThis.GameInfo = {
  Yields: yieldTypes.map((YieldType, $index) => ({
    YieldType,
    Name: `LOC_${YieldType}_NAME`,
    $index,
    $hash: 1000 + $index,
  })),
  Constructibles: [
    null,
    {
      $index: 1,
      $hash: 2001,
      ConstructibleType: "IMPROVEMENT_TEST",
      ConstructibleClass: "IMPROVEMENT",
      Population: 1,
      Name: "LOC_IMPROVEMENT_TEST_NAME",
    },
  ],
  Constructible_YieldChanges: [
    {
      ConstructibleType: "IMPROVEMENT_TEST",
      YieldType: "YIELD_FOOD",
      YieldChange: 1,
    },
  ],
  Resources: [
    null,
    {
      $index: 1,
      $hash: 3001,
      ResourceType: "RESOURCE_TEST",
      ResourceClassType: "RESOURCECLASS_BONUS",
    },
    {
      $index: 2,
      $hash: 3002,
      ResourceType: "RESOURCE_TREASURE_TEST",
      ResourceClassType: "RESOURCECLASS_TREASURE",
    },
  ],
  Terrains: [
    null,
    {
      $index: 1,
      $hash: 4001,
      TerrainType: "TERRAIN_FLAT",
    },
  ],
  District_FreeConstructibles: [
    {
      DistrictType: "DISTRICT_RURAL",
      ConstructibleType: "IMPROVEMENT_TEST",
      TerrainType: "TERRAIN_FLAT",
      Priority: 1,
    },
  ],
};

const natural = {
  YIELD_FOOD: 2,
  YIELD_PRODUCTION: 1,
};
let resourceType = -1;
globalThis.GameplayMap = {
  getLocationFromIndex: () => ({ x: 3, y: 4 }),
  getYield: (_x, _y, yieldType) => natural[yieldType] ?? 0,
  getResourceType: () => resourceType,
};
globalThis.GameContext = { localPlayerID: 0 };
let unassignedBonuses = {};
globalThis.Players = {
  get: () => ({
    Resources: {
      getUnassignedResourceYieldBonus: (yieldHash) => unassignedBonuses[yieldHash] ?? 0,
    },
  }),
};
globalThis.CityCommandTypes = { EXPAND: 77 };
globalThis.Game = {
  CityCommands: {
    canStart: () => ({
      Success: true,
      Plots: [42],
      ConstructibleTypes: [1],
    }),
  },
};

const specialistInfo = {
  PlotIndex: 84,
  IsBlocked: false,
  CurrentYields: [0, 0, 0, 0, 0, 0, 0],
  NextYields: [0, 2, 0, 4, 0, 0, 0],
  CurrentMaintenance: [0, 0, 0, 0, 0, 0, 0],
  NextMaintenance: [2, 0, 0, 0, 0, 2, 0],
};
globalThis.Cities = {
  get: () => ({
    isTown: false,
    Workers: {
      GetAllPlacementInfo: () => [specialistInfo],
    },
  }),
};

const { WeightedYieldRuntime } = await import("../ui/runtime.js");
WeightedYieldRuntime.refresh({ owner: 0, id: 1, type: 1 });

assert.equal(WeightedYieldRuntime.getSpecialistScore(84).score, 3.2);

const improvement = WeightedYieldRuntime.getImprovementScore(42);
assert.equal(improvement.approximate, true);
assert.deepEqual(improvement.resultingRecord, {
  YIELD_FOOD: 3,
  YIELD_PRODUCTION: 1,
  YIELD_GOLD: 0,
  YIELD_SCIENCE: 0,
  YIELD_CULTURE: 0,
  YIELD_HAPPINESS: 0,
  YIELD_DIPLOMACY: 0,
});
assert.equal(improvement.score, 1.6);
assert.deepEqual(improvement.record, improvement.resultingRecord);
assert.ok(Math.abs(improvement.contributions.YIELD_FOOD - 0.6) < 1e-12);
assert.equal(improvement.contributions.YIELD_PRODUCTION, 1);

const hovered = WeightedYieldRuntime.getHoveredImprovementScore(
  42,
  JSON.stringify([
    { name: "LOC_YIELD_FOOD_NAME", value: 2 },
    { name: "LOC_YIELD_PRODUCTION_NAME", value: 1 },
  ]),
);
assert.equal(hovered.approximate, false);
assert.deepEqual(hovered.resultingRecord, {
  YIELD_FOOD: 2,
  YIELD_PRODUCTION: 1,
});
assert.equal(hovered.score, 1.4);
assert.deepEqual(hovered.record, hovered.resultingRecord);
assert.ok(Math.abs(hovered.contributions.YIELD_FOOD - 0.4) < 1e-12);
assert.equal(hovered.contributions.YIELD_PRODUCTION, 1);
assert.equal(WeightedYieldRuntime.getImprovementScore(42).score, 1.4);

// Resource ownership is valued separately from the tile's own yields. Read
// the current rules through PlayerResources so Antiquity, Exploration and
// Modern changes are reflected without hardcoded age multipliers.
resourceType = 1;
unassignedBonuses = { 1002: 1, 1005: 1 };
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
const antiquityResource = WeightedYieldRuntime.getImprovementScore(42);
assert.deepEqual(antiquityResource.resourceRecord, {
  YIELD_GOLD: 1,
  YIELD_HAPPINESS: 1,
});
assert.ok(Math.abs(antiquityResource.score - (1.4 + 17 / 35)) < 1e-12);

unassignedBonuses = { 1002: 2, 1005: 2 };
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
const explorationResource = WeightedYieldRuntime.getImprovementScore(42);
assert.ok(Math.abs(explorationResource.score - (1.4 + 34 / 35)) < 1e-12);

unassignedBonuses = { 1002: 3, 1005: 3 };
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
const modernResource = WeightedYieldRuntime.getImprovementScore(42);
assert.ok(Math.abs(modernResource.score - (1.4 + 51 / 35)) < 1e-12);

// The base-game allocation UI excludes Treasure and Empire resources from
// unassigned-resource yields; match that rule here.
resourceType = 2;
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
assert.deepEqual(WeightedYieldRuntime.getImprovementScore(42).resourceRecord, {});
assert.equal(WeightedYieldRuntime.getImprovementScore(42).score, 1.4);
resourceType = -1;
unassignedBonuses = {};

// PlotWorkersManager resets during the transition into improvement mode.
// Specialist state may be discarded, but the complete improvement list must
// survive so every badge can be drawn before the first hover.
WeightedYieldRuntime.clearSpecialists();
assert.equal(WeightedYieldRuntime.getSpecialistScore(84), null);
assert.equal(WeightedYieldRuntime.getImprovementScore(42).score, 1.4);

// A transient canStart response without Plots must not erase a valid cache.
globalThis.Game.CityCommands.canStart = () => ({ Success: false });
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
assert.equal(WeightedYieldRuntime.getImprovementScore(42).score, 1.4);
globalThis.Game.CityCommands.canStart = () => ({
  Success: true,
  Plots: [42],
  ConstructibleTypes: [1],
});

// Normal production screens have no unassigned citizen. Some game paths return
// a successful command result with an empty Plots array rather than omitting
// Plots. calculateAllBuildingsPlacements only exposes already-owned
// improvement tiles, so the fallback must reconstruct the unowned frontier and
// apply its default rural improvement.
WeightedYieldRuntime.clear();
globalThis.DirectionTypes = {
  DIRECTION_NORTHEAST: 0,
  DIRECTION_EAST: 1,
  DIRECTION_SOUTHEAST: 2,
  DIRECTION_SOUTHWEST: 3,
  DIRECTION_WEST: 4,
  DIRECTION_NORTHWEST: 5,
};
globalThis.GameplayMap.getLocationFromIndex = (plotIndex) =>
  plotIndex === 10 ? { x: 0, y: 0 } : { x: 1, y: 0 };
globalThis.GameplayMap.getAdjacentPlotLocation = (_location, direction) =>
  direction === 0 ? { x: 1, y: 0 } : { x: -1, y: -1 };
globalThis.GameplayMap.getIndexFromLocation = (location) =>
  location.x === 1 && location.y === 0 ? 42 : -1;
globalThis.GameplayMap.getOwner = () => -1;
globalThis.GameplayMap.getTerrainType = () => 4001;
globalThis.MapConstructibles = { getConstructibles: () => [] };
globalThis.Game.CityCommands.canStart = () => ({
  Success: true,
  Plots: [],
  ConstructibleTypes: [],
});
globalThis.Cities.get = () => ({
  isTown: false,
  getPurchasedPlots: () => [10],
  Workers: { GetAllPlacementInfo: () => [] },
});
WeightedYieldRuntime.refreshBuildingCandidates(
  { owner: 0, id: 1, type: 1 },
  {
    buildings: [{
      constructibleType: 2001,
      placements: [{
        plotID: 10,
        overbuiltConstructibleID: -1,
        yieldChanges: [4, 2, 0, 0, 0, 0, 0],
      }],
    }],
  },
);
const reconstructed = WeightedYieldRuntime.getImprovementScore(42);
assert.equal(reconstructed.approximate, true);
assert.equal(reconstructed.inferredFromFrontier, true);
assert.equal(reconstructed.constructible.ConstructibleType, "IMPROVEMENT_TEST");
assert.deepEqual(reconstructed.resultingRecord, {
  YIELD_FOOD: 3,
  YIELD_PRODUCTION: 1,
  YIELD_GOLD: 0,
  YIELD_SCIENCE: 0,
  YIELD_CULTURE: 0,
  YIELD_HAPPINESS: 0,
  YIELD_DIPLOMACY: 0,
});
assert.equal(reconstructed.score, 1.6);

globalThis.Game.CityCommands.canStart = () => ({
  Success: true,
  Plots: [42],
  ConstructibleTypes: [1],
});

// Improvement candidates must still refresh when specialist city data is not
// available yet. This is the path used by PlacePopulation.updateExpandPlots.
WeightedYieldRuntime.clear();
globalThis.Cities.get = () => null;
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 1, type: 1 });
assert.equal(WeightedYieldRuntime.getImprovementScore(42).score, 1.6);

// Towns convert Production to Gold, so each Production point must use the
// Gold weight while Food and every other yield keep their configured weights.
globalThis.Cities.get = () => ({
  isTown: true,
  Workers: { GetAllPlacementInfo: () => [] },
});
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 2, type: 1 });
const townImprovement = WeightedYieldRuntime.getImprovementScore(42);
assert.equal(townImprovement.isTown, true);
assert.ok(Math.abs(townImprovement.score - 31 / 35) < 1e-12);

const hoveredTown = WeightedYieldRuntime.getHoveredImprovementScore(
  42,
  JSON.stringify([
    { name: "LOC_YIELD_FOOD_NAME", value: 2 },
    { name: "LOC_YIELD_PRODUCTION_NAME", value: 1 },
  ]),
);
assert.equal(hoveredTown.isTown, true);
assert.ok(Math.abs(hoveredTown.score - 24 / 35) < 1e-12);

// Dynamic food value uses rural population + specialists, excludes urban
// population, and reads the actual threshold so game-speed scaling is not
// hardcoded by name.
globalThis.YieldTypes = { YIELD_FOOD: 0 };
globalThis.Game.age = 101;
globalThis.Game.turn = 20;
globalThis.Game.maxTurns = 200;
globalThis.Game.getHash = (type) => ({
  AGE_ANTIQUITY: 101,
  AGE_EXPLORATION: 102,
  AGE_MODERN: 103,
})[type];
let actualThreshold = 101;
globalThis.Cities.get = () => ({
  isTown: false,
  ruralPopulation: 1,
  urbanPopulation: 20,
  Workers: {
    getNumWorkers: () => 2,
    GetAllPlacementInfo: () => [],
  },
  Growth: {
    currentFood: 20,
    getNextGrowthFoodThreshold: () => ({ value: actualThreshold }),
  },
  Yields: { getNetYield: () => 5 },
});
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 3, type: 1 });
const standardDynamic = WeightedYieldRuntime.state.foodValuation;
assert.equal(standardDynamic.placementPopulation, 3);
assert.equal(standardDynamic.horizonTurns, 60);
assert.ok(standardDynamic.weight > 0.2);

actualThreshold = 50.5;
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 3, type: 1 });
const onlineDynamic = WeightedYieldRuntime.state.foodValuation;
assert.ok(onlineDynamic.weight > standardDynamic.weight);

// Happiness keeps its ordinary 0.2 weight, then adds the exact value of
// non-Food output restored while a settlement's negative Happiness penalty
// moves toward zero. At -3 Happiness the observed 34 Production is the
// post-penalty value of 40, so +5 Happiness restores 15% = 6 value.
globalThis.YieldTypes = Object.fromEntries(
  yieldTypes.map((yieldType, index) => [yieldType, index]),
);
globalThis.Cities.get = () => ({
  isTown: false,
  Workers: { GetAllPlacementInfo: () => [] },
  Yields: {
    getYield: (yieldType) =>
      yieldType === globalThis.YieldTypes.YIELD_HAPPINESS ? -3 : 0,
    getNetYield: (yieldType) =>
      yieldType === globalThis.YieldTypes.YIELD_PRODUCTION ? 34 : 0,
  },
});
WeightedYieldRuntime.refreshImprovements({ owner: 0, id: 4, type: 1 });
const happinessRecovery = WeightedYieldRuntime.scoreRecord({
  YIELD_HAPPINESS: 5,
});
assert.equal(happinessRecovery.baseScore, 1);
assert.equal(happinessRecovery.happinessAdjustment.beforeHappiness, -3);
assert.equal(happinessRecovery.happinessAdjustment.afterHappiness, 2);
assert.ok(
  Math.abs(happinessRecovery.happinessAdjustment.recoveryRate - 0.15) < 1e-12,
);
assert.equal(happinessRecovery.happinessAdjustment.penaltyFreeWeightedOutput, 40);
assert.ok(
  Math.abs(happinessRecovery.happinessAdjustment.adjustment - 6) < 1e-12,
);
assert.ok(Math.abs(happinessRecovery.score - 7) < 1e-12);

const happinessWorsening = WeightedYieldRuntime.scoreRecord({
  YIELD_HAPPINESS: -1,
});
assert.ok(Math.abs(happinessWorsening.baseScore + 0.2) < 1e-12);
assert.ok(
  Math.abs(happinessWorsening.happinessAdjustment.adjustment + 2) < 1e-12,
);
assert.ok(Math.abs(happinessWorsening.score + 2.2) < 1e-12);

console.log("Weighted Yield Scores runtime tests passed.");
