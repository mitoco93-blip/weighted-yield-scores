import { WeightedYieldConfig } from "./config.js";
import {
  addYieldRecords,
  arrayToYieldRecord,
  getScoreContributions,
  getSpecialistNetRecord,
  getYieldDefinitions,
  scoreYieldRecord,
} from "./scorer.js";
import {
  estimateDynamicFoodWeight,
  getCandidateOutlook,
  getPreliminaryFoodWeight,
} from "./food-valuation.js";
import {
  evaluateHappinessDeficitAdjustment,
  getNegativeHappinessPenalty,
} from "./happiness-valuation.js";

const state = {
  cityID: null,
  isTown: false,
  specialistScores: new Map(),
  improvementScores: new Map(),
  foodValuation: null,
  happinessValuation: null,
  generation: 0,
};

export const SCORE_CACHE_EVENT = "wys-score-cache-refreshed";

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function componentIDsMatch(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.owner === b.owner && a.type === b.type;
}

function updateSettlementContext(cityID, city = undefined) {
  const sameSettlement = componentIDsMatch(state.cityID, cityID);
  if (!sameSettlement) {
    state.foodValuation = null;
    state.specialistScores = new Map();
    state.improvementScores = new Map();
    state.happinessValuation = null;
  }
  state.cityID = cityID;
  if (city) state.isTown = Boolean(city.isTown);
  else if (!sameSettlement) state.isTown = false;
}

function scoreOptions(isTown = false, foodWeight = state.foodValuation?.weight) {
  const options = {};
  if (isTown && WeightedYieldConfig.town?.productionUsesGoldRate) {
    options.weightAliases = { YIELD_PRODUCTION: "YIELD_GOLD" };
  }
  if (Number.isFinite(Number(foodWeight)) && Number(foodWeight) > 0) {
    options.weightOverrides = { YIELD_FOOD: Number(foodWeight) };
  }
  return Object.keys(options).length ? options : undefined;
}

function getWeightedCurrentOutput(profile, options = undefined) {
  const valuation = state.happinessValuation;
  if (!valuation) return 0;
  const contributions = getScoreContributions(
    valuation.currentNetRecord,
    profile,
    options,
  );
  let weightedNetOutput = 0;
  for (const yieldType of valuation.affectedYieldTypes) {
    weightedNetOutput += Math.max(
      0,
      numberOrZero(contributions[yieldType]),
    );
  }
  const retainedRate = 1 - valuation.currentPenaltyRate;
  return retainedRate > 0 ? weightedNetOutput / retainedRate : 0;
}

function getHappinessAdjustment(record, profile, options = undefined) {
  const settings = WeightedYieldConfig.happinessValuation;
  const valuation = state.happinessValuation;
  const happinessDelta = numberOrZero(record?.YIELD_HAPPINESS);
  if (!settings?.enabled || !valuation || Math.abs(happinessDelta) < 1e-9) {
    return null;
  }

  const result = evaluateHappinessDeficitAdjustment({
    currentHappiness: valuation.currentHappiness,
    happinessDelta,
    penaltyFreeWeightedOutput: getWeightedCurrentOutput(profile, options),
    penaltyPerPoint: settings.penaltyPerPoint,
    maximumPenalty: settings.maximumPenalty,
  });
  return Math.abs(result.recoveryRate) < 1e-9 ? null : result;
}

function scoreProfileRecord(
  record,
  profile,
  isTown = state.isTown,
  foodWeight = state.foodValuation?.weight,
) {
  const safeRecord = { ...(record ?? {}) };
  const options = scoreOptions(isTown, foodWeight);
  const contributions = getScoreContributions(safeRecord, profile, options);
  const baseScore = scoreYieldRecord(safeRecord, profile, options);
  const happinessAdjustment = getHappinessAdjustment(
    safeRecord,
    profile,
    options,
  );
  const score = baseScore + numberOrZero(happinessAdjustment?.adjustment);
  return {
    record: safeRecord,
    contributions,
    baseScore,
    happinessAdjustment,
    score: Math.abs(score) < 1e-9 ? 0 : score,
  };
}

function scoreImprovementRecord(
  record,
  isTown = state.isTown,
  foodWeight = state.foodValuation?.weight,
) {
  return scoreProfileRecord(
    record,
    WeightedYieldConfig.improvement,
    isTown,
    foodWeight,
  );
}

function scoreImprovementCandidate(
  candidate,
  foodWeight = state.foodValuation?.weight,
) {
  return scoreImprovementRecord(
    addYieldRecords(candidate?.resultingRecord, candidate?.resourceRecord),
    candidate?.isTown ?? state.isTown,
    foodWeight,
  ).score;
}

function applyImprovementScore(
  candidate,
  foodWeight = state.foodValuation?.weight,
) {
  return Object.assign(
    candidate,
    scoreImprovementRecord(
      addYieldRecords(candidate?.resultingRecord, candidate?.resourceRecord),
      candidate?.isTown ?? state.isTown,
      foodWeight,
    ),
  );
}

function scoreSpecialistPlacement(info, foodWeight = state.foodValuation?.weight) {
  return scoreProfileRecord(
    getSpecialistNetRecord(info),
    WeightedYieldConfig.specialist,
    false,
    foodWeight,
  );
}

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

function notifyScoreCache(kind, reason = "refresh") {
  const target = globalThis.window;
  const EventConstructor = globalThis.CustomEvent;
  if (!target?.dispatchEvent || typeof EventConstructor !== "function") return;
  target.dispatchEvent(
    new EventConstructor(SCORE_CACHE_EVENT, {
      detail: { kind, reason, generation: state.generation },
    }),
  );
}

function getPlotYieldRecord(plotIndex) {
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return {};

  const playerID = globalThis.GameContext?.localPlayerID;
  const record = {};
  for (const definition of getYieldDefinitions()) {
    const yieldType = definition?.YieldType;
    if (!yieldType) continue;
    record[yieldType] = numberOrZero(
      globalThis.GameplayMap?.getYield?.(location.x, location.y, yieldType, playerID),
    );
  }
  return record;
}

function resolveResource(rawType) {
  const table = globalThis.GameInfo?.Resources;
  if (!table || rawType == null || rawType === -1) return null;

  if (table[rawType]) return table[rawType];
  const lookedUp = table.lookup?.(rawType);
  if (lookedUp) return lookedUp;

  for (const definition of table) {
    if (
      definition?.$hash === rawType ||
      definition?.$index === rawType ||
      definition?.ResourceType === rawType
    ) {
      return definition;
    }
  }
  return null;
}

function getPlotResource(plotIndex) {
  const settings = WeightedYieldConfig.resourceValuation;
  if (!settings?.enabled) return null;

  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return null;
  const rawType = globalThis.GameplayMap?.getResourceType?.(location.x, location.y);
  const definition = resolveResource(rawType);
  if (!definition) return null;

  const excluded = settings.excludedClasses ?? [];
  if (excluded.includes(definition.ResourceClassType)) return null;
  return { rawType, definition };
}

function getUnassignedResourceYieldRecord() {
  const playerID = globalThis.GameContext?.localPlayerID;
  const player = globalThis.Players?.get?.(playerID);
  const resources = player?.Resources;
  const getBonus = resources?.getUnassignedResourceYieldBonus;
  if (typeof getBonus !== "function") return {};

  const record = {};
  for (const definition of getYieldDefinitions()) {
    const yieldType = definition?.YieldType;
    const yieldHash = definition?.$hash;
    if (!yieldType || yieldHash == null) continue;
    const value = numberOrZero(getBonus.call(resources, yieldHash));
    if (value > 0) record[yieldType] = value;
  }
  return record;
}

function getResourceValuation(plotIndex) {
  const resource = getPlotResource(plotIndex);
  if (!resource) return { resource: null, resourceRecord: {} };
  return {
    resource,
    resourceRecord: getUnassignedResourceYieldRecord(),
  };
}

function getCurrentAgeName() {
  const game = globalThis.Game;
  const age = game?.age;
  if (game?.getHash && age != null) {
    if (age === game.getHash("AGE_ANTIQUITY")) return "antiquity";
    if (age === game.getHash("AGE_EXPLORATION")) return "exploration";
    if (age === game.getHash("AGE_MODERN")) return "modern";
  }
  const definition = globalThis.GameInfo?.Ages?.lookup?.(age);
  return definition?.AgeType ?? definition?.Type ?? "modern";
}

function getPlacementPopulation(city) {
  const rural = numberOrZero(city?.ruralPopulation);
  const specialists = numberOrZero(city?.Workers?.getNumWorkers?.(false));
  return Math.max(1, Math.floor(rural + specialists));
}

function getEvaluationHorizon() {
  const configured = Math.max(
    1,
    Math.floor(numberOrZero(WeightedYieldConfig.foodValuation?.horizonTurns) || 60),
  );
  const turn = Number(globalThis.Game?.turn);
  const maxTurns = Number(globalThis.Game?.maxTurns);
  if (Number.isFinite(turn) && Number.isFinite(maxTurns) && maxTurns > turn) {
    return Math.max(1, Math.min(configured, Math.floor(maxTurns - turn)));
  }
  return configured;
}

function getFoodPerTurn(city) {
  const yieldType = globalThis.YieldTypes?.YIELD_FOOD;
  if (yieldType == null) return null;
  const value = city?.Yields?.getNetYield?.(yieldType);
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function resolveYieldIndex(yieldType) {
  const direct = globalThis.YieldTypes?.[yieldType];
  if (direct != null) return direct;
  const definition = getYieldDefinitions().find(
    (entry) => entry?.YieldType === yieldType,
  );
  return definition?.$index ?? definition?.$hash ?? null;
}

function refreshHappinessValuation(city) {
  const settings = WeightedYieldConfig.happinessValuation;
  const yields = city?.Yields;
  const happinessIndex = resolveYieldIndex("YIELD_HAPPINESS");
  const currentHappiness = Number(yields?.getYield?.(happinessIndex));
  if (
    !settings?.enabled ||
    happinessIndex == null ||
    !Number.isFinite(currentHappiness) ||
    typeof yields?.getNetYield !== "function"
  ) {
    state.happinessValuation = null;
    return;
  }

  const affectedYieldTypes = Array.from(
    settings.affectedYieldTypes ?? [],
  );
  const currentNetRecord = {};
  for (const yieldType of affectedYieldTypes) {
    const yieldIndex = resolveYieldIndex(yieldType);
    if (yieldIndex == null) continue;
    const value = Number(yields.getNetYield(yieldIndex));
    if (Number.isFinite(value)) currentNetRecord[yieldType] = value;
  }
  state.happinessValuation = {
    currentHappiness,
    currentPenaltyRate: getNegativeHappinessPenalty(currentHappiness, {
      penaltyPerPoint: settings.penaltyPerPoint,
      maximumPenalty: settings.maximumPenalty,
    }),
    currentNetRecord,
    affectedYieldTypes,
  };
}

function revalueCandidateScores(city) {
  refreshHappinessValuation(city);
  const growth = city?.Growth;
  const actualThreshold = Number(growth?.getNextGrowthFoodThreshold?.()?.value);
  const currentFood = Number(growth?.currentFood);
  const foodPerTurn = getFoodPerTurn(city);
  const enabled = Boolean(WeightedYieldConfig.foodValuation?.enabled);

  if (
    !enabled ||
    !Number.isFinite(actualThreshold) ||
    actualThreshold <= 0 ||
    !Number.isFinite(currentFood) ||
    foodPerTurn == null
  ) {
    state.foodValuation = null;
    for (const [plotIndex, candidate] of state.specialistScores) {
      state.specialistScores.set(plotIndex, {
        ...candidate,
        ...scoreSpecialistPlacement(candidate.info, undefined),
      });
    }
    for (const candidate of state.improvementScores.values()) {
      applyImprovementScore(candidate, undefined);
    }
    return;
  }

  const age = getCurrentAgeName();
  const placementPopulation = getPlacementPopulation(city);
  const settings = WeightedYieldConfig.foodValuation;
  const preliminaryWeight = getPreliminaryFoodWeight({
    age,
    placementPopulation,
    actualThreshold,
    minimumWeight: settings.minimumWeight,
    maximumWeight: settings.maximumWeight,
  });
  const candidates = [];

  for (const candidate of state.specialistScores.values()) {
    const preliminary = scoreSpecialistPlacement(candidate.info, preliminaryWeight);
    candidates.push({
      score: preliminary.score,
      food: preliminary.record?.YIELD_FOOD,
    });
  }
  for (const candidate of state.improvementScores.values()) {
    candidates.push({
      score: scoreImprovementCandidate(candidate, preliminaryWeight),
      food: candidate.resultingRecord?.YIELD_FOOD,
    });
  }

  const outlook = getCandidateOutlook(candidates, settings.candidateCount);
  state.foodValuation = {
    ...estimateDynamicFoodWeight({
      age,
      placementPopulation,
      currentFood,
      foodPerTurn,
      actualThreshold,
      horizonTurns: getEvaluationHorizon(),
      expectedCitizenScore: outlook.expectedScore,
      expectedCitizenFood: outlook.expectedFood,
      maximumGrowths: settings.maximumGrowths,
      minimumWeight: settings.minimumWeight,
      maximumWeight: settings.maximumWeight,
    }),
    age,
    candidateCount: outlook.count,
  };

  for (const [plotIndex, candidate] of state.specialistScores) {
    state.specialistScores.set(plotIndex, {
      ...candidate,
      ...scoreSpecialistPlacement(candidate.info, state.foodValuation.weight),
    });
  }
  for (const candidate of state.improvementScores.values()) {
    applyImprovementScore(candidate, state.foodValuation.weight);
  }
}

function resolveConstructible(rawType) {
  const table = globalThis.GameInfo?.Constructibles;
  if (!table || rawType == null) return null;

  if (table[rawType]) return table[rawType];
  const lookedUp = table.lookup?.(rawType);
  if (lookedUp) return lookedUp;

  for (const definition of table) {
    if (
      definition?.$hash === rawType ||
      definition?.$index === rawType ||
      definition?.ConstructibleType === rawType
    ) {
      return definition;
    }
  }
  return null;
}

function getConstructibleStaticYieldRecord(constructible, rawType) {
  const record = {};
  if (!constructible) return record;

  const keys = new Set(
    [
      rawType,
      constructible.$hash,
      constructible.$index,
      constructible.ConstructibleType,
      constructible.ImprovementType,
    ].filter((value) => value != null),
  );

  const rows = globalThis.GameInfo?.Constructible_YieldChanges;
  if (!rows) return record;

  for (const row of rows) {
    const rowType = row?.ConstructibleType ?? row?.ImprovementType;
    if (!keys.has(rowType)) continue;

    const yieldType = row?.YieldType;
    if (!yieldType) continue;
    const amount = row?.YieldChange ?? row?.YieldAmount ?? row?.Amount ?? row?.Value;
    record[yieldType] = numberOrZero(record[yieldType]) + numberOrZero(amount);
  }

  return record;
}

function getExpansionResult(cityID) {
  const commandAPI = globalThis.Game?.CityCommands;
  const commandType = globalThis.CityCommandTypes?.EXPAND;
  if (commandAPI?.canStart && commandType != null) {
    return commandAPI.canStart(cityID, commandType, {}, false);
  }

  // Kept as a compatibility fallback in case Firaxis moves expansion to operations.
  const operationAPI = globalThis.Game?.CityOperations;
  const operationType = globalThis.CityOperationTypes?.EXPAND;
  if (operationAPI?.canStart && operationType != null) {
    return operationAPI.canStart(cityID, operationType, {}, false);
  }

  return null;
}

function refreshSpecialistScores(city) {
  const scores = new Map();
  const placementInfos = city?.Workers?.GetAllPlacementInfo?.() ?? [];

  for (const info of placementInfos) {
    if (!info || info.IsBlocked || info.PlotIndex == null) continue;
    const result = scoreSpecialistPlacement(info);
    scores.set(info.PlotIndex, { ...result, info });
  }

  state.specialistScores = scores;
}

function refreshImprovementScores(cityID, candidateResult = undefined) {
  // Resettlement is a unit command; CityCommands.EXPAND can be empty even
  // when that unit has legal plots. Use its authoritative candidates if given.
  const result = candidateResult === undefined ? getExpansionResult(cityID) : candidateResult;
  const plots = result?.Plots;
  if (!Array.isArray(plots)) {
    diagnostic(
      `Improvement candidate refresh returned no plot list; preserving ${state.improvementScores.size} cached candidates.`,
    );
    return false;
  }

  const scores = new Map();
  const constructibleTypes = result?.ConstructibleTypes ?? [];
  const isTown = state.isTown;

  for (let index = 0; index < plots.length; index += 1) {
    const plotIndex = plots[index];
    const rawType = constructibleTypes[index];
    const constructible = resolveConstructible(rawType);
    const naturalRecord = getPlotYieldRecord(plotIndex);
    const staticImprovementRecord = getConstructibleStaticYieldRecord(constructible, rawType);
    const resultingRecord = addYieldRecords(naturalRecord, staticImprovementRecord);
    const resourceValuation = getResourceValuation(plotIndex);

    const previous = state.improvementScores.get(plotIndex);
    const estimate = {
      plotIndex,
      rawType,
      constructible,
      naturalRecord,
      staticImprovementRecord,
      resultingRecord,
      ...resourceValuation,
      isTown,
      approximate: true,
    };
    applyImprovementScore(estimate);

    // Keep a hover-derived exact value until the candidate list itself changes.
    // This also prevents a PlotWorkersManager refresh from immediately replacing
    // the exact badge with the approximation again.
    const sameConstructible =
      previous &&
      !previous.approximate &&
      previous.isTown === isTown &&
      (previous.rawType == null || previous.rawType === rawType);
    const candidate = sameConstructible
      ? { ...estimate, ...previous, ...resourceValuation }
      : estimate;
    applyImprovementScore(candidate);
    scores.set(plotIndex, candidate);
  }

  state.improvementScores = scores;
  diagnostic(`Cached ${scores.size} improvement candidates.`);
  // In an ordinary production screen the command can legally return an
  // empty Plots array because there is no unassigned citizen.  An empty array
  // is therefore not a usable relocation list: let the caller reconstruct the
  // frontier from calculateAllBuildingsPlacements instead.
  return scores.size > 0;
}

const adjacentDirectionNames = [
  "DIRECTION_NORTHEAST",
  "DIRECTION_EAST",
  "DIRECTION_SOUTHEAST",
  "DIRECTION_SOUTHWEST",
  "DIRECTION_WEST",
  "DIRECTION_NORTHWEST",
];

function getFrontierPlotIndexes(city) {
  const purchased = new Set(city?.getPurchasedPlots?.() ?? []);
  const frontier = new Set();
  const directions = adjacentDirectionNames
    .map((name) => globalThis.DirectionTypes?.[name])
    .filter((value) => value != null);
  const map = globalThis.GameplayMap;
  if (!directions.length || !map?.getAdjacentPlotLocation) return frontier;

  for (const plotIndex of purchased) {
    const location = map.getLocationFromIndex?.(plotIndex);
    if (!location) continue;
    for (const direction of directions) {
      const adjacent = map.getAdjacentPlotLocation(location, direction);
      if (!adjacent || adjacent.x < 0 || adjacent.y < 0) continue;
      const adjacentIndex = map.getIndexFromLocation?.(adjacent);
      if (
        adjacentIndex == null ||
        adjacentIndex < 0 ||
        purchased.has(adjacentIndex)
      ) {
        continue;
      }

      // An unowned frontier plot is a possible destination after a rural
      // district is overbuilt. Do not accidentally value another player's
      // already-owned border plot when two settlements touch.
      const owner = map.getOwner?.(adjacent.x, adjacent.y);
      if (Number.isFinite(Number(owner)) && Number(owner) >= 0) continue;
      frontier.add(adjacentIndex);
    }
  }
  return frontier;
}

function isEmptyExpansionPlot(plotIndex) {
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return false;
  const constructibles = globalThis.MapConstructibles?.getConstructibles?.(
    location.x,
    location.y,
  ) ?? [];
  return constructibles.length === 0;
}

function resolveMapDefinition(tableName, rawType, typeProperty) {
  const table = globalThis.GameInfo?.[tableName];
  if (!table || rawType == null || rawType === -1) return null;
  if (table[rawType]) return table[rawType];
  const lookedUp = table.lookup?.(rawType);
  if (lookedUp) return lookedUp;
  for (const definition of table) {
    if (
      definition?.$hash === rawType ||
      definition?.$index === rawType ||
      definition?.[typeProperty] === rawType
    ) {
      return definition;
    }
  }
  return null;
}

function getPlotRuleContext(plotIndex) {
  const map = globalThis.GameplayMap;
  const location = map?.getLocationFromIndex?.(plotIndex);
  if (!location) return null;

  const terrain = resolveMapDefinition(
    "Terrains",
    map.getTerrainType?.(location.x, location.y),
    "TerrainType",
  );
  const feature = resolveMapDefinition(
    "Features",
    map.getFeatureType?.(location.x, location.y),
    "FeatureType",
  );
  const resource = resolveMapDefinition(
    "Resources",
    map.getResourceType?.(location.x, location.y),
    "ResourceType",
  );
  const biome = resolveMapDefinition(
    "Biomes",
    map.getBiomeType?.(location.x, location.y),
    "BiomeType",
  );

  return {
    TerrainType: terrain?.TerrainType,
    TerrainClassType: terrain?.TerrainClassType,
    FeatureType: feature?.FeatureType,
    FeatureClassType: feature?.FeatureClassType,
    ResourceType: resource?.ResourceType,
    ResourceClassType: resource?.ResourceClassType,
    BiomeType: biome?.BiomeType,
  };
}

const freeConstructibleConditionFields = [
  "TerrainType",
  "TerrainClassType",
  "FeatureType",
  "FeatureClassType",
  "ResourceType",
  "ResourceClassType",
  "BiomeType",
];

function getDefaultRuralConstructible(plotIndex) {
  const rows = globalThis.GameInfo?.District_FreeConstructibles;
  const context = getPlotRuleContext(plotIndex);
  if (!rows || !context) return { rawType: null, constructible: null };

  let selected = null;
  let selectedPriority = -Infinity;
  let selectedSpecificity = -Infinity;
  for (const row of rows) {
    if (
      row?.DistrictType &&
      row.DistrictType !== "DISTRICT_RURAL"
    ) {
      continue;
    }
    let matches = true;
    let specificity = 0;
    for (const field of freeConstructibleConditionFields) {
      if (row?.[field] == null || row[field] === "") continue;
      specificity += 1;
      if (context[field] !== row[field]) {
        matches = false;
        break;
      }
    }
    if (!matches || !row?.ConstructibleType) continue;

    const priority = numberOrZero(row.Priority);
    if (
      priority > selectedPriority ||
      (priority === selectedPriority && specificity > selectedSpecificity)
    ) {
      selected = row;
      selectedPriority = priority;
      selectedSpecificity = specificity;
    }
  }

  const rawType = selected?.ConstructibleType ?? null;
  return {
    rawType,
    constructible: resolveConstructible(rawType),
  };
}

function refreshImprovementScoresFromFrontier(city) {
  const frontier = getFrontierPlotIndexes(city);
  if (!frontier.size) {
    diagnostic("Building relocation estimate found no frontier plots.");
    return false;
  }

  const scores = new Map();
  for (const plotIndex of frontier) {
    if (!isEmptyExpansionPlot(plotIndex)) continue;

    const { rawType, constructible } = getDefaultRuralConstructible(plotIndex);
    const naturalRecord = getPlotYieldRecord(plotIndex);
    const staticImprovementRecord = getConstructibleStaticYieldRecord(
      constructible,
      rawType,
    );
    const resourceValuation = getResourceValuation(plotIndex);
    const candidate = {
      plotIndex,
      rawType,
      constructible,
      naturalRecord,
      staticImprovementRecord,
      resultingRecord: addYieldRecords(
        naturalRecord,
        staticImprovementRecord,
      ),
      ...resourceValuation,
      isTown: Boolean(city?.isTown),
      approximate: true,
      inferredFromFrontier: true,
    };
    applyImprovementScore(candidate);
    scores.set(plotIndex, candidate);
  }

  if (!scores.size) {
    diagnostic("Building relocation estimate found no empty frontier plots.");
    return false;
  }
  state.improvementScores = scores;
  diagnostic(
    `Estimated ${scores.size} relocation candidates from the settlement frontier.`,
  );
  return true;
}

function refreshImprovementScoresFromPlacementData(city, allPlacementData) {
  const placements = allPlacementData?.buildings ?? allPlacementData ?? [];
  if (!Array.isArray(placements) || !placements.length) return false;

  const purchased = new Set(city?.getPurchasedPlots?.() ?? []);

  const byPlot = new Map();
  let multipleOptionPlots = 0;
  for (const constructiblePlacements of placements) {
    const constructible = resolveConstructible(
      constructiblePlacements?.constructibleType,
    );
    if (constructible?.ConstructibleClass !== "IMPROVEMENT") continue;
    if (Number(constructible?.Population) === 0) continue;

    for (const placement of constructiblePlacements?.placements ?? []) {
      const plotIndex = placement?.plotID;
      // calculateAllBuildingsPlacements already contains only legal plots for
      // this constructible.  Treat every empty, not-yet-owned placement as a
      // possible destination for the citizen displaced by a rural overbuild.
      // Rebuilding a frontier with DirectionTypes was redundant and, in town
      // purchase mode, could reject valid candidates when that enum/snapshot
      // was not initialized yet.
      if (plotIndex == null || purchased.has(plotIndex)) continue;
      if (!isEmptyExpansionPlot(plotIndex)) continue;
      if (
        placement?.overbuiltConstructibleID != null &&
        placement.overbuiltConstructibleID !== -1
      ) {
        continue;
      }

      const resourceValuation = getResourceValuation(plotIndex);
      const candidate = {
        plotIndex,
        rawType: constructiblePlacements.constructibleType,
        constructible,
        naturalRecord: {},
        staticImprovementRecord: {},
        resultingRecord: arrayToYieldRecord(placement?.yieldChanges ?? []),
        placement,
        ...resourceValuation,
        isTown: Boolean(city?.isTown),
        approximate: false,
        inferredFromPlacementData: true,
      };
      applyImprovementScore(candidate);

      const previous = byPlot.get(plotIndex);
      if (previous) multipleOptionPlots += 1;
      if (!previous || Number(candidate.score) > Number(previous.score)) {
        byPlot.set(plotIndex, candidate);
      }
    }
  }

  if (!byPlot.size) {
    diagnostic("Building relocation fallback found no valid improvement placements.");
    return false;
  }
  state.improvementScores = byPlot;
  diagnostic(
    `Reconstructed ${byPlot.size} exact relocation candidates from placement data` +
      ` (${multipleOptionPlots} additional improvement options).`,
  );
  return true;
}

function resolveDeltaYieldType(delta, index, deltaCount) {
  const definitions = getYieldDefinitions();
  const candidates = [
    delta?.YieldType,
    delta?.yieldType,
    delta?.Type,
    delta?.type,
    delta?.Name,
    delta?.name,
    delta?.Description,
    delta?.description,
    delta?.Icon,
    delta?.icon,
  ].filter((value) => value != null);

  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      const match = definitions.find(
        (definition) =>
          definition?.$hash === candidate || definition?.$index === candidate,
      );
      if (match?.YieldType) return match.YieldType;
      continue;
    }

    const text = String(candidate).toUpperCase();
    for (const definition of definitions) {
      const yieldType = definition?.YieldType;
      if (!yieldType) continue;
      if (
        text === yieldType.toUpperCase() ||
        text.includes(yieldType.toUpperCase()) ||
        text === String(definition?.Name ?? "").toUpperCase()
      ) {
        return yieldType;
      }
    }
  }

  // Some UI versions serialize the complete yield array without type names.
  if (deltaCount === definitions.length) return definitions[index]?.YieldType ?? null;
  return null;
}

function getDeltaValue(delta) {
  return numberOrZero(
    delta?.value ??
      delta?.Value ??
      delta?.yieldChange ??
      delta?.YieldChange ??
      delta?.amount ??
      delta?.Amount,
  );
}

function parseYieldDeltas(rawDeltas) {
  let deltas = rawDeltas;
  if (typeof deltas === "string") {
    try {
      deltas = JSON.parse(deltas);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(deltas)) return null;

  const record = {};
  let numericEntries = 0;
  let mappedEntries = 0;

  for (let index = 0; index < deltas.length; index += 1) {
    const delta = deltas[index];
    const value = getDeltaValue(delta);
    if (!value) continue;
    numericEntries += 1;

    const yieldType = resolveDeltaYieldType(delta, index, deltas.length);
    if (!yieldType) continue;
    mappedEntries += 1;
    record[yieldType] = numberOrZero(record[yieldType]) + value;
  }

  if (!numericEntries || mappedEntries !== numericEntries) return null;
  return record;
}

export const WeightedYieldRuntime = {
  get state() {
    return state;
  },

  clear() {
    state.cityID = null;
    state.isTown = false;
    state.specialistScores = new Map();
    state.improvementScores = new Map();
    state.foodValuation = null;
    state.happinessValuation = null;
    state.generation += 1;
  },

  clearSpecialists() {
    // PlotWorkersManager resets while the UI is switching into the tile-
    // improvement picker too. Clearing the shared runtime here used to erase
    // the complete improvement candidate list immediately after it was built;
    // hovering then repopulated only one tile at a time.
    state.specialistScores = new Map();
    state.generation += 1;
  },

  refresh(cityID) {
    if (cityID == null) {
      this.clear();
      return;
    }

    try {
      const city = globalThis.Cities?.get?.(cityID);
      updateSettlementContext(cityID, city);
      if (city) refreshSpecialistScores(city);
      refreshImprovementScores(cityID);
      if (city) revalueCandidateScores(city);
      state.generation += 1;
      notifyScoreCache("all", "candidates");
    } catch (error) {
      diagnostic("Could not refresh candidate scores.", error);
    }
  },

  refreshBuildingCandidates(cityID, allPlacementData) {
    if (cityID == null) return false;
    try {
      const city = globalThis.Cities?.get?.(cityID);
      if (!city) return false;
      updateSettlementContext(cityID, city);
      refreshSpecialistScores(city);
      const expanded = refreshImprovementScores(cityID);
      // A same-city cache may come from an earlier growth screen and can
      // contain a plot that has since been acquired. When EXPAND is unavailable
      // rebuild from the current placement snapshot instead of trusting it.
      let reconstructed = false;
      let estimated = false;
      if (!expanded) {
        state.improvementScores = new Map();
        reconstructed = refreshImprovementScoresFromPlacementData(
          city,
          allPlacementData,
        );
        if (!reconstructed) {
          estimated = refreshImprovementScoresFromFrontier(city);
        }
      }
      revalueCandidateScores(city);
      state.generation += 1;
      notifyScoreCache(
        "all",
        reconstructed
          ? "building-fallback"
          : estimated
            ? "building-frontier-estimate"
            : "candidates",
      );
      diagnostic(
        `Building relocation candidates: ${state.improvementScores.size} improvements, ` +
          `${state.specialistScores.size} specialist districts` +
          ` (expand=${expanded}, reconstructed=${reconstructed}, estimated=${estimated}).`,
      );
      return state.improvementScores.size > 0 || state.specialistScores.size > 0;
    } catch (error) {
      diagnostic("Could not refresh building relocation candidates.", error);
      return false;
    }
  },

  refreshSpecialists(cityID) {
    if (cityID == null) return;
    try {
      const city = globalThis.Cities?.get?.(cityID);
      if (!city) return;
      updateSettlementContext(cityID, city);
      refreshSpecialistScores(city);
      revalueCandidateScores(city);
      state.generation += 1;
      notifyScoreCache("specialist", "candidates");
    } catch (error) {
      diagnostic("Could not refresh specialist scores.", error);
    }
  },

  refreshImprovements(cityID, candidateResult = undefined) {
    if (cityID == null) return;
    try {
      const city = globalThis.Cities?.get?.(cityID);
      updateSettlementContext(cityID, city);
      refreshImprovementScores(cityID, candidateResult);
      if (city) revalueCandidateScores(city);
      state.generation += 1;
      notifyScoreCache("improvement", "candidates");
    } catch (error) {
      diagnostic("Could not refresh improvement scores.", error);
    }
  },

  getSpecialistScore(plotIndex, fallbackInfo = undefined) {
    const cached = state.specialistScores.get(plotIndex);
    if (cached) return cached;
    if (!fallbackInfo) return null;
    return { ...scoreSpecialistPlacement(fallbackInfo), info: fallbackInfo };
  },

  isForCity(cityID) {
    return cityID != null && componentIDsMatch(state.cityID, cityID);
  },

  // Building valuation may cache hypothetical relocation plots. Those are not
  // proof that a citizen can actually be placed there in the current picker.
  getPlacementImprovementScore(cityID, plotIndex, validPlots) {
    if (!this.isForCity(cityID) || !validPlots?.includes?.(plotIndex)) return null;
    return this.getImprovementScore(plotIndex);
  },

  getImprovementScore(plotIndex) {
    return state.improvementScores.get(plotIndex) ?? null;
  },

  scoreRecord(record, isTown = state.isTown) {
    return scoreProfileRecord(
      record,
      WeightedYieldConfig.building,
      isTown,
      state.foodValuation?.weight,
    );
  },

  getPopulationCandidates({
    excludePlotIndexes = [],
    includeSpecialists = true,
  } = {}) {
    const excluded = new Set(excludePlotIndexes ?? []);
    const candidates = [];

    for (const candidate of state.improvementScores.values()) {
      if (excluded.has(candidate.plotIndex)) continue;
      candidates.push({
        kind: "improvement",
        plotIndex: candidate.plotIndex,
        scored: candidate,
        record: addYieldRecords(candidate.resultingRecord, candidate.resourceRecord),
      });
    }

    if (includeSpecialists && !state.isTown) {
      for (const candidate of state.specialistScores.values()) {
        if (excluded.has(candidate.info?.PlotIndex)) continue;
        candidates.push({
          kind: "specialist",
          plotIndex: candidate.info?.PlotIndex,
          scored: candidate,
          record: { ...(candidate.record ?? {}) },
        });
      }
    }

    return candidates.filter(({ scored }) =>
      Number.isFinite(Number(scored?.score)),
    );
  },

  getBestPopulationCandidate(options = undefined) {
    const candidates = this.getPopulationCandidates(options);
    if (!candidates.length) return null;
    return candidates.reduce((best, candidate) =>
      Number(candidate.scored.score) > Number(best.scored.score)
        ? candidate
        : best,
    );
  },

  getHoveredImprovementScore(plotIndex, rawYieldDeltas) {
    const estimate = state.improvementScores.get(plotIndex) ?? null;
    const resultingRecord = parseYieldDeltas(rawYieldDeltas);
    if (!resultingRecord) return estimate;

    // PlacePopulation.afterYieldDeltasJSONd contains the complete contribution
    // of the acquired/improved tile. It is not a modifier to add to the map's
    // natural yield a second time (that was the 0.1.3 double-counting bug).
    const exact = {
      ...(estimate ?? { plotIndex }),
      resultingRecord,
      isTown: state.isTown,
      approximate: false,
    };
    applyImprovementScore(exact);

    const changed =
      !estimate ||
      estimate.approximate ||
      Math.abs(numberOrZero(estimate.score) - numberOrZero(exact.score)) > 1e-9;
    state.improvementScores.set(plotIndex, exact);
    if (changed) {
      state.generation += 1;
      notifyScoreCache("improvement", "hover");
    }
    return exact;
  },
};

// Small read-only-ish public surface for FireTuner diagnostics and other UI mods.
globalThis.WeightedYieldScores = WeightedYieldRuntime;
