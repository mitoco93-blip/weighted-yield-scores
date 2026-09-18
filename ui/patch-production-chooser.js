import { BuildingPlacementManager } from "/base-standard/ui/building-placement/building-placement-manager.js";
import { ProductionChooserScreen } from "/base-standard/ui/production-chooser/panel-production-chooser.js";
import {
  getBuildingEvaluationDetailModel,
} from "./building-details.js";
import {
  clearBuildingListScore,
  renderBuildingListScore,
} from "./building-list-score.js";
import { applyFixedBuildingListName } from "./building-list-name.js";
import { correctedYieldDetailsHTML } from "./production-yields.js";
import { updateProductionRowCosts } from "./production-row-layout.js";
import { WeightedYieldConfig } from "./config.js";
import { BUILDING_SORT_MODE, WeightedYieldSettings } from "./settings.js";
import { sortBuildingItems } from "./building-list-sort.js";
import { ensureBuildingSortControls } from "./building-sort-controls.js";
import { WeightedYieldRuntime } from "./runtime.js";
import {
  calculateBuildingPriority,
  evaluateBuildingPlacement,
  selectBestBuildingPlacement,
} from "./building-evaluator.js";

const PATCH_FLAG = "__wysProductionItemsPatchVersion";
const latestEvaluations = new Map();
let latestCityID = null;
let placementSnapshotSerial = 0;

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

function ensurePlacementData(city) {
  // The native chooser only refreshes this snapshot on a subset of queue
  // events.  When the panel is closed while a wonder/building completes and
  // reopened on the same city, the previous placement bundle can otherwise be
  // reused.  Recalculate on every new chooser item bundle so list yields,
  // weighted scores and the subsequent placement screen share current data.
  BuildingPlacementManager.initializePlacementData(city.id);
  placementSnapshotSerial += 1;
  return BuildingPlacementManager.allPlacementData;
}

function scoreItem(city, item, allPlacementData, populationCandidates, isPurchasing) {
  const constructible = globalThis.GameInfo?.Constructibles?.lookup?.(item.type);
  if (!constructible) return null;
  const placementData = allPlacementData.find(
    (entry) => entry.constructibleType === constructible.$hash,
  );
  if (!placementData?.placements?.length) return null;

  const evaluations = placementData.placements
    .map((placement) => evaluateBuildingPlacement({
      city,
      constructible,
      placement,
      isPurchasing,
      isRepairing: Boolean(item.repairDamaged),
      populationCandidates,
    }))
    .filter(Boolean);
  const selected = selectBestBuildingPlacement(evaluations);
  if (!selected.best) return null;
  const itemProductionCost = Number(item.productionCost);
  const engineProductionCost = Number(
    city?.Production?.getConstructibleProductionCost?.(constructible.$hash),
  );
  const productionCost =
    Number.isFinite(itemProductionCost) && itemProductionCost > 0
      ? itemProductionCost
      : engineProductionCost;

  return {
    ...selected.best,
    constructible,
    candidateCount: evaluations.length,
    completeCandidateCount: evaluations.filter(
      (evaluation) => evaluation.complete !== false,
    ).length,
    incompleteRuralCandidateCount: evaluations.filter(
      (evaluation) => evaluation.ruralReplacement && evaluation.complete === false,
    ).length,
    productionCost,
    priority: calculateBuildingPriority({
      score: selected.best.score,
      productionCost,
    }),
  };
}

function decorateAndSortItems(screen, value) {
  // Preserve the incoming bundle and order for native/third-party callers.
  // Re-sorting a rendered bundle must also preserve its first original index.
  const sourceBuildings = value?.buildings;
  const buildings = Array.isArray(sourceBuildings)
    ? sourceBuildings.map((item, index) => ({
      ...item,
      wysOriginalIndex: Number.isFinite(item.wysOriginalIndex) ? item.wysOriginalIndex : index,
    }))
    : sourceBuildings;
  const city = screen?.city;
  if (!city || !Array.isArray(buildings)) return value;

  const placementBundle = ensurePlacementData(city);
  const allPlacementData = placementBundle?.buildings ?? [];
  WeightedYieldRuntime.refreshBuildingCandidates(city.id, placementBundle);
  const populationCandidates = WeightedYieldRuntime.getPopulationCandidates({
    includeSpecialists:
      WeightedYieldConfig.buildingValuation.includeCurrentSpecialists,
  });

  latestCityID = city.id;
  latestEvaluations.clear();
  let scoredCount = 0;
  let incompleteRuralCount = 0;
  for (let index = 0; index < buildings.length; index += 1) {
    const item = buildings[index];
    item.wysBuildingEvaluation = undefined;
    item.wysBuildingPriority = undefined;
    const evaluation = scoreItem(
      city,
      item,
      allPlacementData,
      populationCandidates,
      Boolean(screen.isPurchase),
    );
    if (!evaluation) continue;
    scoredCount += 1;
    incompleteRuralCount += evaluation.incompleteRuralCandidateCount;
    item.wysBuildingEvaluation = evaluation;
    item.wysBuildingPriority = evaluation.priority;
    applyFixedBuildingListName(item);
    latestEvaluations.set(item.type, evaluation);
    if (evaluation.constructible?.ConstructibleType) {
      latestEvaluations.set(
        evaluation.constructible.ConstructibleType,
        evaluation,
      );
    }
    if (evaluation.constructible?.$hash != null) {
      latestEvaluations.set(evaluation.constructible.$hash, evaluation);
    }
    // Do not combine vanilla's simple-total placement preview with our score
    // from a different weighted-best plot.  Both the yield delta and the
    // priority shown in this row now describe evaluation.plotIndex.
    item.secondaryDetails = correctedYieldDetailsHTML(evaluation);
  }

  diagnostic(
    `Placement snapshot #${placementSnapshotSerial}: ${buildings.length} list items, ` +
      `${scoredCount} scored, ${incompleteRuralCount} rural candidates missing relocation ` +
      `(city=${city.id?.owner ?? "?"}:${city.id?.id ?? "?"}, ` +
      `purchase=${Boolean(screen.isPurchase)}).`,
  );

  const mode = WeightedYieldConfig.buildingValuation.sortProductionList
    ? WeightedYieldSettings.get("buildingSortMode")
    : BUILDING_SORT_MODE.DEFAULT;
  return { ...value, buildings: sortBuildingItems(buildings, mode) };
}
function syncBuildingListScores(screen, value) {
  const buildings = value?.buildings;
  const itemElementMap = screen?.itemElementMap;
  if (!Array.isArray(buildings) || !itemElementMap?.forEach) return;

  const evaluationsByType = new Map(
    buildings.map((item) => [item.type, item.wysBuildingEvaluation ?? null]),
  );
  const itemsByType = new Map(
    Object.values(value ?? {}).filter(Array.isArray).flat().filter(item => item?.type)
      .map(item => [item.type, item]),
  );
  itemElementMap.forEach((row, type) => {
    updateProductionRowCosts(row, itemsByType.get(type), screen.city);
    const evaluation = evaluationsByType.get(type);
    if (evaluation) renderBuildingListScore(row, evaluation);
    else clearBuildingListScore(row);
  });
}

function scheduleBuildingListScoreSync(screen, value, onSortChange) {
  const sync = () => {
    try {
      // A queued refresh from an earlier sort/city must not overwrite newer UI.
      if (screen.items !== value) return;
      ensureBuildingSortControls(screen, onSortChange);
      syncBuildingListScores(screen, value);
    } catch (error) {
      diagnostic("Building list score display failed.", error);
    }
  };

  // Existing rows are ready synchronously. Newly connected Solid components
  // can finish their first render just after the native items setter returns,
  // so repeat once on the next task and once on the next rendered frame.
  sync();
  globalThis.setTimeout?.(sync, 0);
  globalThis.requestAnimationFrame?.(sync);
}

function componentIDsMatch(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.owner === b.owner && a.type === b.type;
}

function getLatestBuildingEvaluation(constructibleType) {
  const selectedCityID = globalThis.UI?.Player?.getHeadSelectedCity?.();
  if (!componentIDsMatch(selectedCityID, latestCityID)) return null;

  const direct = latestEvaluations.get(constructibleType);
  if (direct) return direct;

  const definition = globalThis.GameInfo?.Constructibles?.lookup?.(
    constructibleType,
  );
  if (!definition) return null;
  return latestEvaluations.get(definition.ConstructibleType) ??
    latestEvaluations.get(definition.$hash) ??
    null;
}

function getBuildingTooltipModel(constructibleType) {
  const evaluation = getLatestBuildingEvaluation(constructibleType);
  if (!evaluation) return null;
  return getBuildingEvaluationDetailModel(evaluation);
}

function ensureProductionChooserPatched() {
  const prototype = ProductionChooserScreen?.prototype;
  if (!prototype || prototype[PATCH_FLAG] === WeightedYieldConfig.version) return;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "items");
  if (!descriptor?.set || !descriptor?.get) {
    diagnostic("Production chooser items property was not found.");
    return;
  }

  Object.defineProperty(prototype, "items", {
    ...descriptor,
    set(value) {
      try {
        value = decorateAndSortItems(this, value);
      } catch (error) {
        diagnostic("Building list scoring failed; using the game order.", error);
      }
      descriptor.set.call(this, value);
      const onSortChange = (mode) => {
        const current = descriptor.get.call(this);
        if (!Array.isArray(current?.buildings)) return;
        // Reuse scores: changing order does not require another placement scan.
        const reordered = { ...current, buildings: sortBuildingItems(current.buildings, mode) };
        descriptor.set.call(this, reordered);
        scheduleBuildingListScoreSync(this, reordered, onSortChange);
      };
      scheduleBuildingListScoreSync(this, value, onSortChange);
    },
  });
  prototype[PATCH_FLAG] = WeightedYieldConfig.version;
}

if (WeightedYieldConfig.buildingValuation.enabled) {
  // Civ VII 1.4 and City Hall render the production hover as a Solid
  // ProductionTooltip. The imported tooltip overlay reads this data-only API
  // when it is created, after the chooser list has been scored.
  globalThis.WeightedYieldScoresProduction = {
    version: WeightedYieldConfig.version,
    getTooltipModel: getBuildingTooltipModel,
  };
  ensureProductionChooserPatched();
  globalThis.setTimeout?.(ensureProductionChooserPatched, 0);
  globalThis.setTimeout?.(ensureProductionChooserPatched, 1000);
}

