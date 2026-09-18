import { InterfaceMode } from "/core/ui/interface-modes/interface-modes.js";
import LensManager from "/core/ui/lenses/lens-manager.js";
import PlotWorkersManager from "/base-standard/ui/plot-workers/plot-workers-manager.js";
import { WeightedYieldConfig } from "./config.js";
import { formatScore } from "./scorer.js";
import { SCORE_CACHE_EVENT, WeightedYieldRuntime } from "./runtime.js";

// Ensure the game's layer is registered before the first patch attempt.
import "/base-standard/ui/lenses/layer/worker-yields-layer.js";

const LAYER_NAME = "fxs-worker-yields-layer";
const FUNCTION_PATCH_FLAG = "__wysMapBadgePatchVersion";
const diagnosticKeys = new Set();
let improvementRedrawSequence = 0;
const drawnImprovements = new WeakMap();
function drawnPlots(layer) {
  if (!drawnImprovements.has(layer)) drawnImprovements.set(layer, new Set());
  return drawnImprovements.get(layer);
}
function placementHandler() {
  const mode = "INTERFACEMODE_ACQUIRE_TILE";
  return InterfaceMode.getCurrent() === mode ? InterfaceMode.getInterfaceModeHandler(mode) : null;
}
function displayPlots() {
  const handler = placementHandler();
  return handler && WeightedYieldRuntime.isForCity(handler.cityID) ? handler.validPlots ?? [] : [];
}
function redrawImprovementPlots(layer) {
  // Also revisit our previous badges so a newly invalid plot is cleared even
  // when the native growth-domain pass no longer visits it.
  const plots = new Set([...drawnPlots(layer), ...displayPlots()]);
  for (const plot of plots) layer.updatePlot?.(plot);
}

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

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

function compactScore(value, decimals = WeightedYieldConfig.display.mapDecimals) {
  const compactDecimals = Math.abs(numberOrZero(value)) >= 10 ? 0 : decimals;
  return formatScore(value, compactDecimals);
}

function mapTextColor(value) {
  return numberOrZero(value) < 0
    ? WeightedYieldConfig.display.negativeMapTextColor
    : WeightedYieldConfig.display.mapTextColor;
}

function specialistMapFontSize(value, pipScale) {
  const text = compactScore(value);
  const minimum = text.length >= 4
    ? WeightedYieldConfig.display.specialistLongValueMinimumMapFontSize
    : WeightedYieldConfig.display.specialistMinimumMapFontSize;
  return Math.max(
    numberOrZero(minimum),
    numberOrZero(WeightedYieldConfig.display.weightedMapFontSize) *
      numberOrZero(pipScale || 1),
  );
}

function drawBadge(layer, plotIndex, value, position, fontSize) {
  if (plotIndex == null || !Number.isFinite(Number(value))) return false;

  const text = compactScore(value);
  const icon = WeightedYieldConfig.display.mapBadgeIcon ?? "hud_mini_lens_btn";
  const visualizer = layer?.yieldVisualizer;

  // Civ VII 1.4's high-level YieldVisualizer draws this custom sprite, but its
  // addText path leaves the face blank. City Hall's current implementation
  // proves that the underlying background SpriteGrid still renders text when
  // explicit font and offset parameters are supplied, so use that path first.
  const currentGrid = visualizer?.backgroundSpriteGrid;
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  if (currentGrid?.addSprite && currentGrid?.addText && location) {
    diagnosticOnce("renderer-current-grid", "Map badges use backgroundSpriteGrid.");
    // SpriteGrid separates the plot-relative 3D anchor from a camera-facing
    // 2D offset. Keeping these separate prevents a small UI adjustment from
    // becoming a large world-space displacement when the camera zoom changes.
    const anchor = {
      x: numberOrZero(position?.plotOffset?.x),
      y: numberOrZero(position?.plotOffset?.y),
      z: numberOrZero(position?.plotOffset?.z),
    };
    const offset = {
      x: numberOrZero(position?.screenOffset?.x),
      y: numberOrZero(position?.screenOffset?.y),
    };
    currentGrid.addSprite(location, icon, anchor, {
      offset,
      scale: numberOrZero(WeightedYieldConfig.display.improvementBadgeScale) || 1,
    });
    currentGrid.addText(location, text, anchor, {
      fonts: ["TitleFont"],
      fill: mapTextColor(value),
      stroke: 0,
      fontSize,
      faceCamera: true,
      offset,
    });
    return true;
  }

  // Compatibility path used by the pre-1.4 worker-yields layer.
  const legacyGrid = layer?.yieldSpriteGrid;
  if (legacyGrid?.addSprite && legacyGrid?.addText && location) {
    diagnosticOnce("renderer-legacy-grid", "Map badges use legacy yieldSpriteGrid.");
    const anchor = position?.plotOffset ?? { x: 0, y: 0, z: 0 };
    const offset = position?.screenOffset ?? { x: 0, y: 0 };
    legacyGrid.addSprite(location, icon, anchor, {
      offset,
      scale: numberOrZero(WeightedYieldConfig.display.improvementBadgeScale) || 1,
    });
    legacyGrid.addText(location, text, anchor, {
      fonts: ["TitleFont"],
      fontSize,
      faceCamera: true,
      offset,
    });
    return true;
  }

  // Last-resort fallback for a future visualizer revision.
  if (visualizer?.addSprite && visualizer?.addText) {
    diagnosticOnce(
      "renderer-high-level-fallback",
      "Map badges fell back to the high-level YieldVisualizer.",
    );
    const anchor = position?.plotOffset ?? { x: 0, y: 0, z: 0 };
    const offset = position?.screenOffset ?? { x: 0, y: 0 };
    visualizer.addSprite(plotIndex, icon, anchor, {
      offset,
      scale: numberOrZero(WeightedYieldConfig.display.improvementBadgeScale) || 1,
    });
    visualizer.addText(plotIndex, text, anchor, {
      fonts: ["TitleFont"],
      fill: mapTextColor(value),
      stroke: 0,
      fontSize,
      faceCamera: true,
      offset,
    });
    return true;
  }

  diagnosticOnce("renderer-missing", "No compatible map badge renderer was found.");
  return false;
}

function drawTextOnExistingSprite(layer, plotIndex, value, position, fontSize) {
  if (plotIndex == null || !Number.isFinite(Number(value))) return false;

  const text = compactScore(value);
  const visualizer = layer?.yieldVisualizer;
  // Native specialist pips are drawn on the foreground grid. Text placed on
  // the background grid is rendered correctly but hidden behind the purple
  // pip, which is exactly what happened in 0.1.7-alpha.
  const currentGrid = visualizer?.foregroundSpriteGrid;
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(plotIndex);
  const anchor = {
    x: numberOrZero(position?.anchorX),
    y: numberOrZero(position?.anchorY),
    z: Number.isFinite(Number(position?.z)) ? Number(position.z) : 5,
  };
  const offset = {
    x: numberOrZero(position?.offsetX),
    y: numberOrZero(position?.offsetY),
  };

  if (currentGrid?.addText && location) {
    diagnosticOnce(
      "renderer-existing-pip",
      "Specialist scores use the next existing specialist pip.",
    );
    currentGrid.addText(location, text, anchor, {
      fonts: ["TitleFont"],
      fill: mapTextColor(value),
      stroke: 0,
      fontSize,
      faceCamera: true,
      offset,
    });
    return true;
  }

  const legacyGrid = layer?.yieldSpriteGrid;
  if (legacyGrid?.addText && location) {
    const legacyPosition = {
      x: anchor.x + offset.x,
      y: anchor.y + offset.y,
      z: anchor.z,
    };
    legacyGrid.addText(location, text, legacyPosition, {
      fonts: ["TitleFont"],
      fontSize,
      faceCamera: true,
    });
    return true;
  }

  // No extra fallback sprite here: if this path is unavailable, an empty
  // native pip is preferable to bringing back the disliked detached badge.
  diagnosticOnce(
    "renderer-existing-pip-missing",
    "No compatible text renderer was found for the specialist pip.",
  );
  return false;
}

function getNextSpecialistPipPosition(layer, info) {
  // The base layer uses the per-plot cap. cityWorkerCap is a city-wide value
  // and can select a pip that does not exist on this district.
  const workerCap = Math.max(
    0,
    Math.floor(
      numberOrZero(info?.MaxWorkers) ||
        numberOrZero(PlotWorkersManager.cityWorkerCap),
    ),
  );
  const currentWorkers = Math.max(0, Math.floor(numberOrZero(info?.NumWorkers)));
  if (workerCap <= 0 || currentWorkers >= workerCap) return null;
  const offsetFunction =
    layer?.getSpecialistPipOffsetsAndScale ??
    layer?.getSpecialistPipOffsetAndScale;

  const nextWorkerIndex = currentWorkers;
  let pipOffset = null;
  if (typeof offsetFunction === "function") {
    pipOffset = offsetFunction.call(layer, nextWorkerIndex, workerCap - 1);
  }

  const configured = WeightedYieldConfig.display.specialistPipTextOffset;

  return {
    // The game passes these values as the plot anchor when it draws the pip.
    // The optional config adjustment belongs in the 2D instance offset.
    anchorX: numberOrZero(pipOffset?.xOffset ?? pipOffset?.x),
    anchorY: numberOrZero(pipOffset?.yOffset ?? pipOffset?.y),
    offsetX: numberOrZero(configured?.x),
    offsetY: numberOrZero(configured?.y),
    z: 5,
    scale: numberOrZero(pipOffset?.scale) || 1,
  };
}

function drawSpecialistBadge(layer, info) {
  if (!WeightedYieldConfig.display.showMapScores) return;
  if (!info || info.IsBlocked || info.PlotIndex == null) return;

  // The fallback matters when the layer draws before the manager's cache event.
  const scored = WeightedYieldRuntime.getSpecialistScore(info.PlotIndex, info);
  if (!scored) return;

  const position = getNextSpecialistPipPosition(layer, info);
  if (!position) return;
  drawTextOnExistingSprite(
    layer,
    info.PlotIndex,
    scored.score,
    position,
    specialistMapFontSize(scored.score, position.scale),
  );
}

function drawImprovementBadge(layer, plotIndex) {
  if (!WeightedYieldConfig.display.showMapScores) return;

  const handler = placementHandler();
  if (!handler) return;
  const scored = WeightedYieldRuntime.getPlacementImprovementScore(
    handler.cityID, plotIndex, handler.validPlots,
  );
  if (!scored) return;

  const configured = WeightedYieldConfig.display.improvementPosition;
  const drawn = drawBadge(
    layer,
    plotIndex,
    scored.score,
    {
      plotOffset: {
        x: numberOrZero(configured?.plotOffset?.x),
        y: numberOrZero(configured?.plotOffset?.y),
        z: numberOrZero(configured?.plotOffset?.z),
      },
      screenOffset: {
        x: numberOrZero(configured?.screenOffset?.x),
        y: numberOrZero(configured?.screenOffset?.y),
      },
    },
    WeightedYieldConfig.display.weightedMapFontSize,
  );
  if (drawn) drawnPlots(layer).add(plotIndex);
}

function wrapAfter(layer, methodName, after) {
  const current = layer?.[methodName];
  if (typeof current !== "function") return false;
  if (current[FUNCTION_PATCH_FLAG] === WeightedYieldConfig.version) return true;

  const wrapped = function (...args) {
    const hadBadge = methodName === "updatePlot" && drawnPlots(this).delete(args[0]);
    if (hadBadge) {
      // Clear only plots on which this mod previously drew an improvement
      // badge, then let the original layer rebuild its own decoration.
      this.yieldVisualizer?.clearPlot?.(args[0]);
    }
    const result = current.apply(this, args);
    try {
      if (hadBadge && !displayPlots().includes(args[0])) {
        const workerInfo = PlotWorkersManager.allWorkerPlots?.find(info => info.PlotIndex === args[0]);
        if (workerInfo) this.updateSpecialistPlot?.(workerInfo);
      }
      after(this, ...args);
    } catch (error) {
      diagnostic(`${methodName} map badge hook failed.`, error);
    }
    return result;
  };
  wrapped[FUNCTION_PATCH_FLAG] = WeightedYieldConfig.version;
  layer[methodName] = wrapped;
  return true;
}

function wrapGrowthRefresh(layer) {
  const methodName = "realizeGrowthPlots";
  const current = layer?.[methodName];
  if (typeof current !== "function") return false;
  if (current[FUNCTION_PATCH_FLAG] === WeightedYieldConfig.version) return true;

  const wrapped = function (...args) {
    const result = current.apply(this, args);
    try {
      redrawImprovementPlots(this);
    } catch (error) {
      diagnostic("Growth candidate score refresh failed.", error);
    }
    return result;
  };
  wrapped[FUNCTION_PATCH_FLAG] = WeightedYieldConfig.version;
  layer[methodName] = wrapped;
  return true;
}

function ensureLayerPatched() {
  const layer = LensManager.layers.get(LAYER_NAME);
  if (!layer) {
    diagnostic("The worker-yields lens layer was not found.");
    return null;
  }

  const specialistPatched = wrapAfter(
    layer,
    "updateSpecialistPlot",
    (activeLayer, info) => drawSpecialistBadge(activeLayer, info),
  );
  const improvementPatched = wrapAfter(
    layer,
    "updatePlot",
    (activeLayer, plotIndex) => drawImprovementBadge(activeLayer, plotIndex),
  );
  wrapGrowthRefresh(layer);
  wrapAfter(layer, "removeLayer", activeLayer => {
    drawnPlots(activeLayer).clear();
    improvementRedrawSequence += 1;
  });

  if (!specialistPatched) {
    diagnostic("worker-yields-layer.updateSpecialistPlot was not found.");
  }
  if (!improvementPatched) {
    diagnostic("worker-yields-layer.updatePlot was not found.");
  }
  return layer;
}

function redrawCachedImprovementScores(realizeAllGrowthPlots = false) {
  const layer = ensureLayerPatched();
  if (!layer) return;

  if (placementHandler() && realizeAllGrowthPlots && typeof layer.realizeGrowthPlots === "function") {
    diagnosticOnce(
      "improvement-full-realize",
      "Improvement candidates received a delayed full growth-plot redraw.",
    );
    layer.realizeGrowthPlots();
    return;
  }

  redrawImprovementPlots(layer);
}

function scheduleImprovementRedraw(reason) {
  if (reason === "hover") {
    const sequence = improvementRedrawSequence;
    globalThis.setTimeout?.(() => {
      if (sequence === improvementRedrawSequence) redrawCachedImprovementScores();
    }, 0);
    return;
  }

  // updateExpandPlots runs before the acquire-tile lens has finished its own
  // first realization. That later pass clears our first badges. Repeat a few
  // bounded redraws, including one normal full growth-plot realization after
  // the interface transition has settled.
  const sequence = ++improvementRedrawSequence;
  const attempts = [
    { delay: 0, realizeAll: false },
    { delay: 100, realizeAll: false },
    { delay: 250, realizeAll: true },
    { delay: 600, realizeAll: false },
  ];
  for (const attempt of attempts) {
    globalThis.setTimeout?.(() => {
      if (sequence !== improvementRedrawSequence) return;
      redrawCachedImprovementScores(attempt.realizeAll);
    }, attempt.delay);
  }
}

function onScoreCacheRefreshed(event) {
  // Specialist values are calculated directly from the info passed to
  // updateSpecialistPlot, so forcing that renderer outside specialist mode can
  // only create stale overlays. Improvement candidates, in contrast, are
  // cached before the acquire-tile layer finishes its first pass and therefore
  // need a delayed redraw after that pass as well.
  if (event?.detail?.kind === "improvement") {
    scheduleImprovementRedraw(event?.detail?.reason);
  }
}

// Patch immediately, then retry after all UIScripts have had an opportunity to
// replace the same layer methods. Function markers prevent duplicate wrapping.
ensureLayerPatched();
globalThis.window?.addEventListener?.(SCORE_CACHE_EVENT, onScoreCacheRefreshed);
globalThis.window?.addEventListener?.("DOMContentLoaded", ensureLayerPatched, {
  once: true,
});
globalThis.setTimeout?.(ensureLayerPatched, 0);
globalThis.setTimeout?.(ensureLayerPatched, 1000);
