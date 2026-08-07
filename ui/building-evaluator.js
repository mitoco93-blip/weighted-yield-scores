import { WeightedYieldConfig } from "./config.js";
import { addYieldRecords, arrayToYieldRecord } from "./scorer.js";
import { WeightedYieldRuntime } from "./runtime.js";

const KABAKAS_LAKE_TYPE = "IMPROVEMENT_KABAKAS_LAKE";

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function resolveConstructible(rawType) {
  if (rawType == null || rawType === -1) return null;
  const table = globalThis.GameInfo?.Constructibles;
  if (!table) return null;
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

function isRuralDistrictAtPlot(plotIndex) {
  if (plotIndex == null) return false;
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return false;
  const district = globalThis.Districts?.getAtLocation?.(location);
  return district?.type === globalThis.DistrictTypes?.RURAL;
}

function getImprovementAtPlot(plotIndex) {
  if (plotIndex == null) return null;
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return null;
  const ids = globalThis.MapConstructibles?.getConstructibles?.(
    location.x,
    location.y,
  ) ?? [];
  for (const id of ids) {
    const instance = globalThis.Constructibles?.getByComponentID?.(id);
    const definition = instance ? resolveConstructible(instance.type) : null;
    if (definition?.ConstructibleClass === "IMPROVEMENT") return definition;
  }
  return null;
}

export function isConstructedImprovement(constructible) {
  if (constructible?.ConstructibleClass !== "IMPROVEMENT") return false;

  const constructibleType = constructible?.ConstructibleType;
  const freeConstructibles = globalThis.GameInfo?.District_FreeConstructibles;
  if (constructibleType && freeConstructibles) {
    for (const row of freeConstructibles) {
      if (
        (!row?.DistrictType || row.DistrictType === "DISTRICT_RURAL") &&
        row?.ConstructibleType === constructibleType
      ) {
        return false;
      }
    }
    return true;
  }

  // Older snapshots may omit District_FreeConstructibles. Population was the
  // best available discriminator there, but it is not authoritative in the
  // live game: manually built unique improvements such as Gama also use 1.
  return Number(constructible?.Population) === 0;
}

export function getPlotYieldRecord(plotIndex) {
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (!location) return {};

  const playerID = globalThis.GameContext?.localPlayerID;
  const record = {};
  for (const definition of globalThis.GameInfo?.Yields ?? []) {
    const yieldType = definition?.YieldType;
    if (!yieldType) continue;
    record[yieldType] = numberOrZero(
      globalThis.GameplayMap?.getYield?.(
        location.x,
        location.y,
        yieldType,
        playerID,
      ),
    );
  }
  return record;
}

export function getConstructibleStaticYieldRecord(constructible) {
  const record = {};
  if (!constructible) return record;

  const keys = new Set(
    [
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
    const amount =
      row?.YieldChange ?? row?.YieldAmount ?? row?.Amount ?? row?.Value;
    record[yieldType] =
      numberOrZero(record[yieldType]) + numberOrZero(amount);
  }

  return record;
}

function negativeYieldRecord(record) {
  const result = {};
  for (const [yieldType, value] of Object.entries(record ?? {})) {
    result[yieldType] = -numberOrZero(value);
  }
  return result;
}

function sameConstructible(a, b) {
  if (!a || !b) return false;
  return Boolean(
    (a.ConstructibleType && a.ConstructibleType === b.ConstructibleType) ||
    (a.$hash != null && a.$hash === b.$hash) ||
    (a.$index != null && a.$index === b.$index),
  );
}

export function getMissedBuildingOverbuildRecord(city, placement) {
  const previous = resolveConstructible(
    placement?.overbuiltConstructibleID,
  );
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(
    placement?.plotID,
  );
  const district = location
    ? globalThis.Districts?.getAtLocation?.(location)
    : null;
  if (
    previous?.ConstructibleClass !== "BUILDING" ||
    typeof district?.getOverbuildableConstructibleTypes !== "function"
  ) {
    return {};
  }

  let rawTypes = [];
  try {
    rawTypes = Array.from(
      district.getOverbuildableConstructibleTypes() ?? [],
    );
  } catch {
    return {};
  }

  const overbuildable = [];
  for (const rawType of rawTypes) {
    const definition = resolveConstructible(rawType);
    if (
      definition?.ConstructibleClass !== "BUILDING" ||
      overbuildable.some((entry) => sameConstructible(entry, definition))
    ) {
      continue;
    }
    overbuildable.push(definition);
  }

  // Only correct the engine delta when its selected building is present in the
  // authoritative overbuildable list. If the APIs ever disagree after a game
  // update, keeping the engine result is safer than subtracting every building.
  if (!overbuildable.some((entry) => sameConstructible(entry, previous))) {
    return {};
  }

  let correction = {};
  for (const definition of overbuildable) {
    if (sameConstructible(definition, previous)) continue;

    correction = addYieldRecords(
      correction,
      negativeYieldRecord(
        getConstructibleStaticYieldRecord(definition),
      ),
    );
    const maintenance = city?.Constructibles?.getMaintenance?.(
      definition.ConstructibleType,
    ) ?? [];
    correction = addYieldRecords(
      correction,
      arrayToYieldRecord(
        Array.from(maintenance, numberOrZero),
      ),
    );
  }
  return correction;
}

export function getPlotAdjacencyYieldRecord(plotIndex) {
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  const adjacencyType = globalThis.YieldSourceTypes?.ADJACENCY;
  if (!location || adjacencyType == null) return {};

  try {
    const modifiers = globalThis.MapPlotYields?.getYieldsModifiers?.(
      location.x,
      location.y,
    );
    if (!modifiers) return {};

    const record = {};
    const yieldDefinitions = Array.from(globalThis.GameInfo?.Yields ?? []);
    for (let index = 0; index < yieldDefinitions.length; index += 1) {
      const yieldType = yieldDefinitions[index]?.YieldType;
      const modifier = modifiers[index];
      if (
        !yieldType ||
        Number(modifier?.type) !== Number(adjacencyType)
      ) {
        continue;
      }
      const value = numberOrZero(modifier?.value);
      if (Math.abs(value) >= 1e-9) record[yieldType] = value;
    }
    return record;
  } catch {
    // This is a correction for one base-game special case. If a future game
    // update removes the runtime API, retain the engine's placement delta
    // instead of breaking the placement screen.
    return {};
  }
}

function getImprovementReplacementCorrection(
  overwrittenImprovement,
  plotIndex,
) {
  if (
    overwrittenImprovement?.ConstructibleType !== KABAKAS_LAKE_TYPE
  ) {
    return {};
  }
  return getPlotAdjacencyYieldRecord(plotIndex);
}

export function getOverwrittenConstructedImprovement(placement) {
  const snapshotImprovement = resolveConstructible(
    placement?.overbuiltConstructibleID,
  );
  if (isConstructedImprovement(snapshotImprovement)) {
    return snapshotImprovement;
  }

  const liveImprovement = getImprovementAtPlot(placement?.plotID);
  return isConstructedImprovement(liveImprovement) ? liveImprovement : null;
}

export function isRuralReplacement(placement) {
  const previous = resolveConstructible(
    placement?.overbuiltConstructibleID,
  );
  if (previous?.ConstructibleClass === "IMPROVEMENT") return true;
  if (getImprovementAtPlot(placement?.plotID)) return true;
  // The placement snapshot does not always retain overbuiltConstructibleID
  // for an ExpandUrbanPlot.  The live district API is authoritative here:
  // converting an existing rural district displaces its assigned citizen.
  return isRuralDistrictAtPlot(placement?.plotID);
}

export function displacesRuralPopulation(
  constructible,
  placement,
  forceRuralReplacement = false,
) {
  // Improvement-to-improvement replacements (for example Lumber Camp -> Gama)
  // keep the citizen on the same rural tile. The engine's placement yield
  // changes already describe the resulting improvement, so adding a second
  // population destination would double-count that citizen.
  if (constructible?.ConstructibleClass === "IMPROVEMENT") return false;
  return Boolean(forceRuralReplacement) || isRuralReplacement(placement);
}

export function getPlacementYieldRecord(city, constructible, placement) {
  const values = Array.from(placement?.yieldChanges ?? [], numberOrZero);
  const cityConstructibles = city?.Constructibles;

  // The engine's placement array contains adjacency, warehouse, overbuild and
  // worker changes. Maintenance is applied by the base UI separately, so do
  // the same here before weighting the result.
  if (cityConstructibles) {
    const previous = resolveConstructible(
      placement?.overbuiltConstructibleID,
    );
    if (previous) {
      const maintenance = cityConstructibles.getMaintenance?.(
        previous.ConstructibleType,
      ) ?? [];
      for (let index = 0; index < maintenance.length; index += 1) {
        values[index] = numberOrZero(values[index]) + numberOrZero(maintenance[index]);
      }
    }

    if (constructible) {
      const maintenance = cityConstructibles.getMaintenance?.(
        constructible.ConstructibleType,
      ) ?? [];
      for (let index = 0; index < maintenance.length; index += 1) {
        values[index] = numberOrZero(values[index]) - numberOrZero(maintenance[index]);
      }
    }
  }

  return arrayToYieldRecord(values);
}

export function selectBestRelocationCandidate(candidates, excludedPlotIndex) {
  const viable = (candidates ?? []).filter(
    (candidate) =>
      candidate?.plotIndex !== excludedPlotIndex &&
      Number.isFinite(Number(candidate?.scored?.score)),
  );
  if (!viable.length) return null;
  return viable.reduce((best, candidate) =>
    Number(candidate.scored.score) > Number(best.scored.score)
      ? candidate
      : best,
  );
}

export function evaluateBuildingPlacement({
  city,
  constructible,
  placement,
  isPurchasing = false,
  isRepairing = false,
  populationCandidates = undefined,
  forceRuralReplacement = false,
} = {}) {
  if (!city || !constructible || !placement) return null;

  const enginePlacementRecord = getPlacementYieldRecord(
    city,
    constructible,
    placement,
  );
  const overwrittenImprovement =
    !isRepairing && getOverwrittenConstructedImprovement(placement);
  // A building removes the whole rural tile, so its complete live output must
  // be subtracted before the displaced citizen is relocated.
  //
  // For improvement-to-improvement replacement, the engine already subtracts
  // the old constructed improvement's direct yields. Subtracting its static
  // yields here would count that loss twice. Kabaka's Lake is the one known
  // exception: removing it also removes lake-dependent adjacency yields that
  // the engine omits. Read and subtract that live ADJACENCY contribution.
  const replacesWithImprovement =
    constructible?.ConstructibleClass === "IMPROVEMENT";
  const overwrittenImprovementRecord = overwrittenImprovement
    ? replacesWithImprovement
      ? getImprovementReplacementCorrection(
        overwrittenImprovement,
        placement.plotID,
      )
      : getPlotYieldRecord(placement.plotID)
    : null;
  const missedBuildingOverbuildRecord =
    !isRepairing && constructible?.ConstructibleClass === "BUILDING"
      ? getMissedBuildingOverbuildRecord(city, placement)
      : {};
  const buildingRecord = addYieldRecords(
    addYieldRecords(
      enginePlacementRecord,
      negativeYieldRecord(overwrittenImprovementRecord),
    ),
    missedBuildingOverbuildRecord,
  );
  const ruralReplacement =
    !isRepairing &&
    displacesRuralPopulation(
      constructible,
      placement,
      forceRuralReplacement,
    );
  let relocation = null;

  if (ruralReplacement) {
    const candidates = populationCandidates ?? WeightedYieldRuntime.getPopulationCandidates({
      excludePlotIndexes: [placement.plotID],
      includeSpecialists:
        WeightedYieldConfig.buildingValuation.includeCurrentSpecialists,
    });
    relocation = selectBestRelocationCandidate(candidates, placement.plotID);
  }

  const correctedRecord = addYieldRecords(
    buildingRecord,
    relocation?.record,
  );
  const buildingScored = WeightedYieldRuntime.scoreRecord(
    buildingRecord,
    Boolean(city.isTown),
  );
  const correctedScored = WeightedYieldRuntime.scoreRecord(
    correctedRecord,
    Boolean(city.isTown),
  );
  const relocationScored = WeightedYieldRuntime.scoreRecord(
    relocation?.record,
    Boolean(city.isTown),
  );

  return {
    plotIndex: placement.plotID,
    placement,
    enginePlacementRecord,
    buildingRecord,
    overwrittenImprovement,
    overwrittenImprovementRecord,
    missedBuildingOverbuildRecord,
    correctedRecord,
    buildingScore: buildingScored.score,
    buildingBaseScore: buildingScored.baseScore,
    buildingContributions: buildingScored.contributions,
    score: correctedScored.score,
    baseScore: correctedScored.baseScore,
    correctedContributions: correctedScored.contributions,
    happinessAdjustment: correctedScored.happinessAdjustment,
    relocation,
    relocationScore: relocationScored.score,
    relocationBaseScore: relocationScored.baseScore,
    relocationContributions: relocationScored.contributions,
    ruralReplacement,
    // Never present a rural overbuild as fully evaluated unless the displaced
    // citizen has a legal destination. Treating a missing candidate as +0 was
    // the misleading result seen in 0.3.0-alpha.
    complete: !ruralReplacement || Boolean(relocation),
    isPurchasing: Boolean(isPurchasing),
    // The current UI API cannot ask the engine for WorkerPlacementInfo on a
    // district that does not exist yet. Existing specialist destinations are
    // exact; a specialist slot created by an instant purchase is not simulated.
    purchaseNewSpecialistEstimated: false,
  };
}

export function selectBestBuildingPlacement(evaluations, epsilon = 1e-9) {
  const viable = (evaluations ?? []).filter(
    (entry) =>
      entry?.complete !== false && Number.isFinite(Number(entry?.score)),
  );
  if (!viable.length) return { best: null, bestPlotIndexes: [] };
  const best = viable.reduce((current, entry) =>
    Number(entry.score) > Number(current.score) ? entry : current,
  );
  const bestPlotIndexes = viable
    .filter((entry) => Math.abs(Number(entry.score) - Number(best.score)) <= epsilon)
    .map((entry) => entry.plotIndex);
  return { best, bestPlotIndexes };
}

export function calculateBuildingPriority({
  score,
  productionCost,
} = {}) {
  const value = numberOrZero(score);
  const production = numberOrZero(productionCost);
  const scale = numberOrZero(
    WeightedYieldConfig.buildingValuation.priorityScale,
  ) || 10000;
  return production > 0 ? Math.round(value * scale / production) : 0;
}
