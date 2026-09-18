import assert from "node:assert/strict";
import {
  calculateBuildingPriority,
  displacesRuralPopulation,
  evaluateBuildingPlacement,
  getPlotAdjacencyYieldRecord,
  getPlacementYieldRecord,
  getOverwrittenConstructedImprovement,
  isConstructedImprovement,
  isRuralReplacement,
  selectBestBuildingPlacement,
  selectBestRelocationCandidate,
} from "../ui/building-evaluator.js";
import { WeightedYieldRuntime } from "../ui/runtime.js";

globalThis.GameInfo = {
  Yields: [
    { YieldType: "YIELD_PRODUCTION" },
    { YieldType: "YIELD_GOLD" },
    { YieldType: "YIELD_HAPPINESS" },
    { YieldType: "YIELD_CULTURE" },
    { YieldType: "YIELD_DIPLOMACY" },
  ],
  Constructibles: Object.assign([
    {
      $index: 7,
      ConstructibleType: "IMPROVEMENT_FARM",
      ConstructibleClass: "IMPROVEMENT",
      Population: 1,
    },
    {
      $index: 8,
      $hash: 1008,
      ConstructibleType: "IMPROVEMENT_GAMA",
      ConstructibleClass: "IMPROVEMENT",
      Population: 1,
      Age: "AGE_EXPLORATION",
      CostProgressionModel: "COST_PROGRESSION_PREVIOUS_COPIES_CITY",
    },
    {
      $index: 9,
      ConstructibleType: "IMPROVEMENT_MOUND",
      ConstructibleClass: "IMPROVEMENT",
      Population: 1,
      Age: "AGE_ANTIQUITY",
      CostProgressionModel: "COST_PROGRESSION_PREVIOUS_COPIES_CITY",
    },
    {
      $index: 10,
      $hash: 1010,
      ConstructibleType: "IMPROVEMENT_KABAKAS_LAKE",
      ConstructibleClass: "IMPROVEMENT",
      Population: 1,
      Age: "AGE_MODERN",
      CostProgressionModel: "COST_PROGRESSION_PREVIOUS_COPIES_CITY",
    },
  ], {
    lookup: (type) =>
      globalThis.GameInfo.Constructibles.find(
        (entry) => entry?.ConstructibleType === type,
      ) ?? null,
  }),
  District_FreeConstructibles: [
    {
      DistrictType: "DISTRICT_RURAL",
      ConstructibleType: "IMPROVEMENT_FARM",
    },
    {
      DistrictType: "DISTRICT_RURAL",
      ConstructibleType: "IMPROVEMENT_VILLAGE",
    },
  ],
  Constructible_YieldChanges: [
    {
      ConstructibleType: "IMPROVEMENT_GAMA",
      YieldType: "YIELD_HAPPINESS",
      YieldChange: 5,
    },
    {
      ConstructibleType: "IMPROVEMENT_GAMA",
      YieldType: "YIELD_CULTURE",
      YieldChange: 1,
    },
  ],
};
globalThis.GameplayMap = { getLocationFromIndex: () => ({ x: 1, y: 1 }) };
let liveImprovementType = null;
let livePlotRecord = {};
const liveComponentID = { id: 4456503, owner: 0, type: 2 };
globalThis.GameplayMap.getYield = (_x, _y, yieldType) =>
  livePlotRecord[yieldType] ?? 0;
globalThis.MapConstructibles = {
  getConstructibles: () => liveImprovementType ? [liveComponentID] : [],
};
globalThis.Constructibles = {
  getByComponentID: (componentID) =>
    liveImprovementType && componentID === liveComponentID
      ? { type: liveImprovementType }
      : null,
};
globalThis.DistrictTypes = { RURAL: 3, URBAN: 2 };
globalThis.Districts = { getAtLocation: () => ({ type: 3 }) };

assert.equal(
  isConstructedImprovement(
    globalThis.GameInfo.Constructibles.lookup("IMPROVEMENT_GAMA"),
  ),
  true,
);
assert.equal(
  isConstructedImprovement(globalThis.GameInfo.Constructibles[0]),
  false,
);
assert.equal(
  isConstructedImprovement({
    ConstructibleType: "IMPROVEMENT_VILLAGE",
    ConstructibleClass: "IMPROVEMENT",
    Population: 0,
  }),
  false,
  "a free rural improvement remains automatic even when Population is 0",
);

assert.equal(
  isRuralReplacement({ plotID: 44 }),
  true,
  "a live rural district must be treated as a displaced citizen even when the snapshot omits its overbuilt ID",
);
assert.equal(
  displacesRuralPopulation(
    {
      ConstructibleType: "IMPROVEMENT_GAMA",
      ConstructibleClass: "IMPROVEMENT",
    },
    { plotID: 44, overbuiltConstructibleID: 7 },
    true,
  ),
  false,
  "replacing one improvement with another keeps the citizen on the tile",
);

const placementRecord = getPlacementYieldRecord(
  {
    Constructibles: {
      getMaintenance: (type) =>
        type === "IMPROVEMENT_FARM" ? [0, 1] : [0, 2],
    },
  },
  { ConstructibleType: "BUILDING_MARKET" },
  { yieldChanges: [3, 2], overbuiltConstructibleID: 7 },
);
assert.deepEqual(placementRecord, {
  YIELD_PRODUCTION: 3,
  YIELD_GOLD: 1,
  YIELD_HAPPINESS: 0,
  YIELD_CULTURE: 0,
  YIELD_DIPLOMACY: 0,
}, "old maintenance is restored and new maintenance is subtracted");

const relocation = selectBestRelocationCandidate([
  { plotIndex: 1, scored: { score: 2 } },
  { plotIndex: 2, scored: { score: 5 } },
  { plotIndex: 3, scored: { score: 4 } },
], 2);
assert.equal(relocation.plotIndex, 3, "excluded source plot must not be reused");

const selected = selectBestBuildingPlacement([
  { plotIndex: 10, score: 3 },
  { plotIndex: 9, score: 99, complete: false },
  { plotIndex: 11, score: 6 },
  { plotIndex: 12, score: 6 },
]);
assert.equal(selected.best.score, 6);
assert.deepEqual(selected.bestPlotIndexes, [11, 12]);

assert.equal(
  calculateBuildingPriority({ score: 8, productionCost: 400 }),
  200,
);
assert.equal(
  calculateBuildingPriority({ score: 5, productionCost: 250 }),
  200,
);
assert.equal(
  calculateBuildingPriority({ score: 7.24, productionCost: 646 }),
  112,
);

globalThis.Districts.getAtLocation = () => ({ type: 2 });
const detailed = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: { ConstructibleType: "BUILDING_MARKET" },
  placement: { plotID: 44, yieldChanges: [3, 7] },
});
assert.deepEqual(detailed.buildingContributions, {
  YIELD_PRODUCTION: 3,
  YIELD_GOLD: 2,
  YIELD_HAPPINESS: 0,
  YIELD_CULTURE: 0,
  YIELD_DIPLOMACY: 0,
});
assert.deepEqual(detailed.correctedContributions, {
  YIELD_PRODUCTION: 3,
  YIELD_GOLD: 2,
  YIELD_HAPPINESS: 0,
  YIELD_CULTURE: 0,
  YIELD_DIPLOMACY: 0,
});
assert.equal(detailed.score, 5);

const withRelocation = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: { ConstructibleType: "BUILDING_MARKET" },
  placement: { plotID: 44, yieldChanges: [3, 7] },
  forceRuralReplacement: true,
  populationCandidates: [{
    kind: "improvement",
    plotIndex: 45,
    record: { YIELD_PRODUCTION: 1, YIELD_GOLD: 7 },
    scored: { score: 3 },
  }],
});
assert.deepEqual(withRelocation.relocationContributions, {
  YIELD_PRODUCTION: 1,
  YIELD_GOLD: 2,
});
assert.equal(withRelocation.relocationScore, 3);
assert.equal(withRelocation.score, 8);

const replacementImprovement = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: {
    ConstructibleType: "IMPROVEMENT_GAMA",
    ConstructibleClass: "IMPROVEMENT",
  },
  placement: {
    plotID: 44,
    overbuiltConstructibleID: 7,
    // Production +2, Culture +3, Influence +1.
    yieldChanges: [2, 0, 0, 3, 1],
  },
  forceRuralReplacement: true,
  populationCandidates: [{
    kind: "improvement",
    plotIndex: 45,
    record: { YIELD_PRODUCTION: 1, YIELD_GOLD: 7 },
    scored: { score: 3 },
  }],
});
assert.equal(replacementImprovement.ruralReplacement, false);
assert.equal(replacementImprovement.relocation, null);
assert.equal(replacementImprovement.complete, true);
assert.equal(replacementImprovement.score, 5.5);

// Live Constructible instances expose the numeric database hash in the game,
// not necessarily the string ConstructibleType accepted by table.lookup().
liveImprovementType = 1008;
livePlotRecord = {
  YIELD_PRODUCTION: 7,
  YIELD_GOLD: 0,
  YIELD_HAPPINESS: 2,
  YIELD_CULTURE: 3,
  YIELD_DIPLOMACY: 1,
};
assert.equal(
  getOverwrittenConstructedImprovement({ plotID: 44 })?.ConstructibleType,
  "IMPROVEMENT_GAMA",
);

WeightedYieldRuntime.state.happinessValuation = null;
const uniqueToBuilding = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: {
    ConstructibleType: "BUILDING_GUILDHALL",
    ConstructibleClass: "BUILDING",
  },
  placement: {
    plotID: 44,
    // The engine returns only the new building's change and omits the Gama.
    yieldChanges: [4, 0, -3, 0, 0],
  },
  forceRuralReplacement: true,
  populationCandidates: [{
    kind: "improvement",
    plotIndex: 45,
    record: { YIELD_PRODUCTION: 2 },
    scored: { score: 2 },
  }],
});
assert.deepEqual(uniqueToBuilding.enginePlacementRecord, {
  YIELD_PRODUCTION: 4,
  YIELD_GOLD: 0,
  YIELD_HAPPINESS: -3,
  YIELD_CULTURE: 0,
  YIELD_DIPLOMACY: 0,
});
assert.deepEqual(uniqueToBuilding.buildingRecord, {
  YIELD_PRODUCTION: -3,
  YIELD_GOLD: 0,
  YIELD_HAPPINESS: -5,
  YIELD_CULTURE: -3,
  YIELD_DIPLOMACY: -1,
});
assert.equal(uniqueToBuilding.ruralReplacement, true);
assert.equal(uniqueToBuilding.relocationScore, 2);
assert.ok(Math.abs(uniqueToBuilding.score + 5.5) < 1e-9);

const uniqueToUnique = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: {
    ConstructibleType: "IMPROVEMENT_MOUND",
    ConstructibleClass: "IMPROVEMENT",
    Population: 1,
  },
  placement: {
    plotID: 44,
    // The engine already includes the overwritten Gama's direct losses:
    // Happiness -5, Culture -1, plus the Mound's Influence +4.
    yieldChanges: [0, 0, -5, -1, 4],
  },
  forceRuralReplacement: true,
  populationCandidates: [{
    kind: "improvement",
    plotIndex: 45,
    record: { YIELD_PRODUCTION: 99 },
    scored: { score: 99 },
  }],
});
assert.deepEqual(uniqueToUnique.buildingRecord, {
  YIELD_PRODUCTION: 0,
  YIELD_GOLD: 0,
  YIELD_HAPPINESS: -5,
  YIELD_CULTURE: -1,
  YIELD_DIPLOMACY: 4,
});
assert.deepEqual(uniqueToUnique.overwrittenImprovementRecord, {
});
assert.equal(uniqueToUnique.ruralReplacement, false);
assert.equal(uniqueToUnique.relocation, null);
assert.ok(Math.abs(uniqueToUnique.score - 6.5) < 1e-9);

const compactYieldDefinitions = globalThis.GameInfo.Yields;
globalThis.GameInfo.Yields = [
  { YieldType: "YIELD_FOOD" },
  { YieldType: "YIELD_PRODUCTION" },
  { YieldType: "YIELD_GOLD" },
  { YieldType: "YIELD_SCIENCE" },
  { YieldType: "YIELD_CULTURE" },
  { YieldType: "YIELD_HAPPINESS" },
  { YieldType: "YIELD_DIPLOMACY" },
];

const university = {
  $index: 112,
  $hash: -689809087,
  ConstructibleType: "BUILDING_UNIVERSITY",
  ConstructibleClass: "BUILDING",
};
const temple = {
  $index: 111,
  $hash: 1519892624,
  ConstructibleType: "BUILDING_TEMPLE",
  ConstructibleClass: "BUILDING",
};
globalThis.GameInfo.Constructibles.push(university, temple);
globalThis.GameInfo.Constructible_YieldChanges.push(
  {
    ConstructibleType: "BUILDING_UNIVERSITY",
    YieldType: "YIELD_SCIENCE",
    YieldChange: 8,
  },
  {
    ConstructibleType: "BUILDING_TEMPLE",
    YieldType: "YIELD_HAPPINESS",
    YieldChange: 6,
  },
);
globalThis.Districts.getAtLocation = () => ({
  type: 2,
  // These are eligible candidates, not a list of buildings actually removed.
  getOverbuildableConstructibleTypes: () => [
    temple.$hash,
    university.$hash,
  ],
});
liveImprovementType = null;
const twoBuildingCity = {
  isTown: false,
  Constructibles: {
    getMaintenance: (type) => {
      if (type === "BUILDING_UNIVERSITY") {
        return [0, 0, 3, 0, 0, 3, 0];
      }
      if (type === "BUILDING_TEMPLE") {
        return [0, 0, 3, 0, 0, 0, 0];
      }
      if (type === "BUILDING_RAIL_STATION") {
        return [0, 0, 0, 0, 0, 4, 0];
      }
      return [];
    },
  },
};
const twoBuildingPlacement = {
  plotID: 44,
  overbuiltConstructibleID: temple.$index,
  // The engine selects the Temple. The University must remain untouched.
  yieldChanges: [0, 9, 13, 1, 1, -6, 0],
};
const railStationOverUniversityAndTemple = evaluateBuildingPlacement({
  city: twoBuildingCity,
  constructible: {
    ConstructibleType: "BUILDING_RAIL_STATION",
    ConstructibleClass: "BUILDING",
  },
  placement: twoBuildingPlacement,
});
assert.deepEqual(
  railStationOverUniversityAndTemple.enginePlacementRecord,
  {
    YIELD_FOOD: 0,
    YIELD_PRODUCTION: 9,
    YIELD_GOLD: 16,
    YIELD_SCIENCE: 1,
    YIELD_CULTURE: 1,
    YIELD_HAPPINESS: -10,
    YIELD_DIPLOMACY: 0,
  },
);
assert.deepEqual(railStationOverUniversityAndTemple.buildingRecord,
  railStationOverUniversityAndTemple.enginePlacementRecord,
  "Only the selected building may be deducted");
const originalRecord = railStationOverUniversityAndTemple.buildingRecord;
globalThis.Districts.getAtLocation = () => ({type: 2,
  getOverbuildableConstructibleTypes: () => [university.$hash, temple.$hash, university.$hash]});
assert.deepEqual(evaluateBuildingPlacement({city: twoBuildingCity,
  constructible: {ConstructibleType: "BUILDING_RAIL_STATION", ConstructibleClass: "BUILDING"},
  placement: twoBuildingPlacement}).buildingRecord, originalRecord,
  "Candidate ordering and duplicates must not change the actual loss");

globalThis.YieldSourceTypes = { ADJACENCY: 1 };
globalThis.MapPlotYields = {
  getYieldsModifiers: () => [
    { type: 1, value: 6 },
    { type: 1, value: 0 },
    { type: 1, value: 0 },
    { type: 1, value: 0 },
    { type: 1, value: 6 },
    { type: 1, value: 0 },
    { type: 1, value: 0 },
  ],
};
assert.deepEqual(getPlotAdjacencyYieldRecord(44), {
  YIELD_FOOD: 6,
  YIELD_CULTURE: 6,
});

liveImprovementType = 1010;
WeightedYieldRuntime.state.foodValuation = null;
WeightedYieldRuntime.state.happinessValuation = null;
const kabakasLakeToOpenAirMuseum = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: { getMaintenance: () => [] },
  },
  constructible: {
    ConstructibleType: "IMPROVEMENT_OPEN_AIR_MUSEUM",
    ConstructibleClass: "IMPROVEMENT",
    Population: 1,
  },
  placement: {
    plotID: 44,
    // The engine includes the new improvement and old direct Happiness loss,
    // but omits the lake-dependent Food and Culture losses.
    yieldChanges: [0, 0, 0, 4, 5, -3, 0],
  },
});
assert.deepEqual(kabakasLakeToOpenAirMuseum.enginePlacementRecord, {
  YIELD_FOOD: 0,
  YIELD_PRODUCTION: 0,
  YIELD_GOLD: 0,
  YIELD_SCIENCE: 4,
  YIELD_CULTURE: 5,
  YIELD_HAPPINESS: -3,
  YIELD_DIPLOMACY: 0,
});
assert.deepEqual(kabakasLakeToOpenAirMuseum.overwrittenImprovementRecord, {
  YIELD_FOOD: 6,
  YIELD_CULTURE: 6,
});
assert.deepEqual(kabakasLakeToOpenAirMuseum.buildingRecord, {
  YIELD_FOOD: -6,
  YIELD_PRODUCTION: 0,
  YIELD_GOLD: 0,
  YIELD_SCIENCE: 4,
  YIELD_CULTURE: -1,
  YIELD_HAPPINESS: -3,
  YIELD_DIPLOMACY: 0,
});
assert.ok(Math.abs(kabakasLakeToOpenAirMuseum.score + 0.3) < 1e-9);

globalThis.GameInfo.Yields = compactYieldDefinitions;
globalThis.MapPlotYields.getYieldsModifiers = () => {
  throw new Error("API unavailable");
};
assert.deepEqual(
  getPlotAdjacencyYieldRecord(44),
  {},
  "a missing runtime API must safely fall back to the engine delta",
);
delete globalThis.MapPlotYields;
delete globalThis.YieldSourceTypes;

liveImprovementType = null;
livePlotRecord = {};
WeightedYieldRuntime.state.happinessValuation = null;
const negativeHappinessFixed = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: {
      getMaintenance: (type) =>
        type === "BUILDING_UNHAPPY" ? [0, 0, 2] : [],
    },
  },
  constructible: { ConstructibleType: "BUILDING_UNHAPPY" },
  placement: { plotID: 44, yieldChanges: [0, 0, 0] },
});
assert.equal(
  negativeHappinessFixed.baseScore,
  -0.4,
  "negative building Happiness must retain its fixed weight",
);
assert.equal(negativeHappinessFixed.happinessAdjustment, null);
assert.equal(negativeHappinessFixed.score, -0.4);

WeightedYieldRuntime.state.happinessValuation = {
  currentHappiness: -1,
  currentPenaltyRate: 0.05,
  currentNetRecord: { YIELD_PRODUCTION: 38 },
  affectedYieldTypes: ["YIELD_PRODUCTION"],
};
const negativeHappinessDeficit = evaluateBuildingPlacement({
  city: {
    isTown: false,
    Constructibles: {
      getMaintenance: (type) =>
        type === "BUILDING_UNHAPPY" ? [0, 0, 2] : [],
    },
  },
  constructible: { ConstructibleType: "BUILDING_UNHAPPY" },
  placement: { plotID: 44, yieldChanges: [0, 0, 0] },
});
assert.equal(negativeHappinessDeficit.happinessAdjustment.beforeHappiness, -1);
assert.equal(negativeHappinessDeficit.happinessAdjustment.afterHappiness, -3);
assert.ok(
  Math.abs(
    negativeHappinessDeficit.happinessAdjustment.recoveryRate + 0.1,
  ) < 1e-9,
);
assert.equal(
  negativeHappinessDeficit.happinessAdjustment.penaltyFreeWeightedOutput,
  40,
);
assert.ok(
  Math.abs(negativeHappinessDeficit.happinessAdjustment.adjustment + 4) < 1e-9,
);
assert.ok(
  Math.abs(negativeHappinessDeficit.score + 4.4) < 1e-9,
  "a building that deepens a Happiness deficit must lose both fixed and dynamic value",
);

console.log("building evaluator tests passed");
