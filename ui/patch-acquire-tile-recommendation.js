import { InterfaceMode } from "/core/ui/interface-modes/interface-modes.js";
import PlotWorkersManager from "/base-standard/ui/plot-workers/plot-workers-manager.js";
import { WeightedYieldConfig } from "./config.js";
import {
  getBestPlotIndexes,
  mergeRecommendationCandidates,
} from "./recommendation.js";
import { SCORE_CACHE_EVENT, WeightedYieldRuntime } from "./runtime.js";

// Ensure the base handler exists. City Hall may replace its decorate method;
// the delayed patch attempts below deliberately wrap whichever method is last.
import "/base-standard/ui/interface-modes/interface-mode-acquire-tile.js";

const MODE_NAME = "INTERFACEMODE_ACQUIRE_TILE";
const PATCH_FLAG = "__wysWeightedRecommendationPatchVersion";
const OWN_GROUP_KEY = "__wysWeightedRecommendationModelGroup";
const ACTIVE_KEY = "__wysWeightedRecommendationActive";
const VFX_RING = "VFX_3dUI_Tut_SelectThis_01";
const VFX_OFFSET = { x: 0, y: 0, z: 0 };
const VFX_PARAMS = { placement: PlacementMode.TERRAIN };
const diagnosticKeys = new Set();

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

function diagnosticOnce(key, message) {
  if (!WeightedYieldConfig.diagnostics || diagnosticKeys.has(key)) return;
  diagnosticKeys.add(key);
  console.warn(`[Weighted Yield Scores] ${message}`);
}

function getRecommendationGroup(handler) {
  // City Hall creates this group for its ordinary-total recommendation ring.
  // Reusing and clearing it replaces that ring instead of drawing two rings.
  if (handler?.growthModelGroup?.clear && handler.growthModelGroup?.addVFXAtPlot) {
    diagnosticOnce("city-hall-ring", "Weighted recommendations replace the City Hall total-yield ring.");
    return handler.growthModelGroup;
  }

  if (!handler?.[OWN_GROUP_KEY] && globalThis.WorldUI?.createModelGroup) {
    handler[OWN_GROUP_KEY] = WorldUI.createModelGroup("wysWeightedRecommendationModelGroup");
    diagnosticOnce("standalone-ring", "Weighted recommendations use a standalone ring.");
  }
  return handler?.[OWN_GROUP_KEY] ?? null;
}

function candidateScores(handler) {
  const city = globalThis.Cities?.get?.(handler?.cityID);
  if (!city || !WeightedYieldRuntime.isForCity(handler.cityID)) return [];

  // The same list is used by the game to accept tile selection. Do not union
  // it with the runtime cache, which also serves hypothetical building costs.
  const improvementPlotIndexes = new Set(handler.validPlots ?? []);
  const improvements = Array.from(improvementPlotIndexes).map((plotIndex) => ({
    plotIndex,
    scored: WeightedYieldRuntime.getPlacementImprovementScore(handler.cityID, plotIndex, handler.validPlots),
  }));

  if (city.isTown || !WeightedYieldRuntime.isForCity(PlotWorkersManager.cityID)) {
    return mergeRecommendationCandidates(improvements);
  }

  const specialists = (PlotWorkersManager.workablePlotIndexes ?? []).map(
    (plotIndex) => ({
      plotIndex,
      scored: WeightedYieldRuntime.getSpecialistScore(plotIndex),
    }),
  );

  // A city can spend its new citizen on either a rural improvement or a
  // specialist. Compare both branches in the same production-equivalent unit.
  return mergeRecommendationCandidates(improvements, specialists);
}

function realizeWeightedRecommendation(handler) {
  const group = getRecommendationGroup(handler);
  if (!group) return;
  group.clear();

  const bestPlots = getBestPlotIndexes(candidateScores(handler));
  for (const plotIndex of bestPlots) {
    group.addVFXAtPlot(VFX_RING, plotIndex, VFX_OFFSET, VFX_PARAMS);
  }
}

function scheduleRecommendation(handler) {
  for (const delay of [0, 100, 300]) {
    globalThis.setTimeout?.(() => {
      if (!handler?.[ACTIVE_KEY]) return;
      try {
        realizeWeightedRecommendation(handler);
      } catch (error) {
        diagnostic("Weighted recommendation redraw failed.", error);
      }
    }, delay);
  }
}

function wrapAfter(handler, methodName, after) {
  const current = handler?.[methodName];
  if (typeof current !== "function") return false;
  if (current[PATCH_FLAG] === WeightedYieldConfig.version) return true;

  const wrapped = function (...args) {
    const result = current.apply(this, args);
    try {
      after(this, ...args);
    } catch (error) {
      diagnostic(`${methodName} recommendation hook failed.`, error);
    }
    return result;
  };
  wrapped[PATCH_FLAG] = WeightedYieldConfig.version;
  handler[methodName] = wrapped;
  return true;
}

function ensureRecommendationPatched() {
  const handler = InterfaceMode.getInterfaceModeHandler(MODE_NAME);
  if (!handler) {
    diagnostic("Acquire-tile interface handler was not found.");
    return null;
  }

  wrapAfter(handler, "decorate", (activeHandler) => {
    activeHandler[ACTIVE_KEY] = true;
    scheduleRecommendation(activeHandler);
  });

  const deactivate = (activeHandler) => {
    activeHandler[ACTIVE_KEY] = false;
    getRecommendationGroup(activeHandler)?.clear?.();
  };
  wrapAfter(handler, "undecorate", deactivate);
  wrapAfter(handler, "transitionFrom", deactivate);
  wrapAfter(handler, "reset", deactivate);
  return handler;
}

function onScoreCacheRefreshed() {
  const handler = ensureRecommendationPatched();
  if (handler?.[ACTIVE_KEY]) scheduleRecommendation(handler);
}

ensureRecommendationPatched();
globalThis.window?.addEventListener?.(SCORE_CACHE_EVENT, onScoreCacheRefreshed);
globalThis.window?.addEventListener?.("DOMContentLoaded", ensureRecommendationPatched, {
  once: true,
});
globalThis.setTimeout?.(ensureRecommendationPatched, 0);
globalThis.setTimeout?.(ensureRecommendationPatched, 1000);
