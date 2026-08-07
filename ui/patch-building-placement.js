import { InterfaceMode } from "/core/ui/interface-modes/interface-modes.js";
import LensManager from "/core/ui/lenses/lens-manager.js";
import {
  BuildingPlacementConstructibleChangedEventName,
  BuildingPlacementManager,
  BuildingPlacementSelectedPlotChangedEventName,
} from "/base-standard/ui/building-placement/building-placement-manager.js";
import "/base-standard/ui/lenses/layer/building-placement-layer.js";
import "/base-standard/ui/interface-modes/interface-mode-place-building.js";
import "/base-standard/ui/place-building/panel-place-building-v2.js";
import { getBuildingEvaluationDetailModel } from "./building-details.js";
import { WeightedYieldConfig } from "./config.js";
import { parenthesize, t } from "./i18n.js";
import { formatScore } from "./scorer.js";
import { WeightedYieldRuntime } from "./runtime.js";
import {
  calculateBuildingPriority,
  evaluateBuildingPlacement,
  selectBestBuildingPlacement,
} from "./building-evaluator.js";

const LAYER_NAME = "fxs-building-placement-layer";
const MODE_NAME = "INTERFACEMODE_PLACE_BUILDING";
const PATCH_FLAG = "__wysBuildingPlacementPatchVersion";
const VFX_RING = "VFX_3dUI_Tut_SelectThis_01";
const recommendationGroup = globalThis.WorldUI?.createModelGroup?.(
  "WYSBuildingRecommendationModelGroup",
);
let evaluationsByPlot = new Map();
let bestPlotIndexes = [];

const numberOrZero = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

function isPurchasing() {
  const handler = InterfaceMode.getInterfaceModeHandler?.(MODE_NAME);
  if (typeof handler?.isPurchasing === "boolean") return handler.isPurchasing;
  return Boolean(InterfaceMode.getParameters?.()?.IsPurchasing);
}

function componentIDsMatch(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.id === b.id && a.owner === b.owner && a.type === b.type;
}

function buildWeightedPlacementOptions() {
  const cityID = BuildingPlacementManager.cityID;
  const city = cityID ? globalThis.Cities?.get?.(cityID) : null;
  const constructible = BuildingPlacementManager.currentConstructible;
  if (!city || !constructible) {
    evaluationsByPlot = new Map();
    bestPlotIndexes = [];
    return [];
  }

  if (
    !componentIDsMatch(WeightedYieldRuntime.state.cityID, cityID) ||
    WeightedYieldRuntime.state.improvementScores.size === 0
  ) {
    WeightedYieldRuntime.refreshBuildingCandidates(
      cityID,
      BuildingPlacementManager.allPlacementData,
    );
  }
  const populationCandidates = WeightedYieldRuntime.getPopulationCandidates({
    includeSpecialists:
      WeightedYieldConfig.buildingValuation.includeCurrentSpecialists,
  });
  const validPlots = Array.from(new Set([
    ...(BuildingPlacementManager.expandablePlots ?? []),
    ...(BuildingPlacementManager.developedPlots ?? []),
    ...(BuildingPlacementManager.urbanPlots ?? []),
  ]));
  const developedPlots = new Set(BuildingPlacementManager.developedPlots ?? []);
  const purchasing = isPurchasing();
  const productionCost = Number(
    city?.Production?.getConstructibleProductionCost?.(constructible.$hash),
  );
  const options = [];
  const nextCache = new Map();

  for (const plotIndex of validPlots) {
    const placement = BuildingPlacementManager.getPlacementPlotData?.(plotIndex);
    if (!placement) continue;
    const baseEvaluation = evaluateBuildingPlacement({
      city,
      constructible,
      placement,
      isPurchasing: purchasing,
      isRepairing: BuildingPlacementManager.isRepairing,
      populationCandidates,
      // The engine has already classified these ExpandUrbanPlots as existing
      // developed districts.  Passing that classification avoids relying on
      // an overbuilt ID that can be absent from a placement snapshot.
      forceRuralReplacement: developedPlots.has(plotIndex),
    });
    if (!baseEvaluation) continue;
    const evaluation = {
      ...baseEvaluation,
      constructible,
      productionCost,
      priority: calculateBuildingPriority({
        score: baseEvaluation.score,
        productionCost,
      }),
    };
    const changes = BuildingPlacementManager.getTotalYieldChanges?.(plotIndex) ?? [];
    nextCache.set(plotIndex, evaluation);
    options.push({
      plotIndex,
      changes,
      netChange: evaluation.score,
      netPrimary: evaluation.score,
      recommended: false,
      wysEvaluation: evaluation,
    });
  }

  const selected = selectBestBuildingPlacement(
    options.map((option) => option.wysEvaluation),
  );
  const best = new Set(selected.bestPlotIndexes);
  for (const option of options) option.recommended = best.has(option.plotIndex);
  options.sort((a, b) => Number(b.netChange) - Number(a.netChange));
  evaluationsByPlot = nextCache;
  bestPlotIndexes = selected.bestPlotIndexes;
  return options;
}

function getScoreBadgeOffset(layer, evaluation) {
  const changes = BuildingPlacementManager.getTotalYieldChanges?.(
    evaluation.plotIndex,
  ) ?? [];
  const gainCount = changes.filter(
    (change) => numberOrZero(change?.yieldChange) > 0,
  ).length;
  const lossCount = changes.filter(
    (change) => numberOrZero(change?.yieldChange) < 0,
  ).length;
  // The score sits on the gain row whenever one exists, so its horizontal
  // position must follow that row rather than a wider loss row below it.
  const rowCount = gainCount > 0 ? gainCount : Math.max(lossCount, 1);
  const rowOffsets = layer?.getXYOffsetForPill?.(rowCount) ?? [];
  const rightmostX = rowOffsets.reduce(
    (maximum, position) => Math.max(maximum, numberOrZero(position?.x)),
    0,
  );
  const configured = WeightedYieldConfig.display.buildingPosition;
  return {
    x:
      rightmostX +
      numberOrZero(configured?.horizontalGap) +
      numberOrZero(configured?.screenOffset?.x),
    y:
      numberOrZero(
        gainCount > 0 ? configured?.gainRowY : configured?.lossRowY,
      ) + numberOrZero(configured?.screenOffset?.y),
  };
}

function drawScoreBadge(layer, evaluation) {
  if (
    !WeightedYieldConfig.buildingValuation.showPlacementScores ||
    evaluation?.complete === false
  ) {
    return;
  }
  const backgroundGrid = layer?.yieldVisualizer?.backgroundSpriteGrid;
  const foregroundGrid = layer?.yieldVisualizer?.foregroundSpriteGrid;
  const location = globalThis.GameplayMap?.getLocationFromIndex?.(
    evaluation.plotIndex,
  );
  if (!backgroundGrid?.addSprite || !foregroundGrid?.addText || !location) {
    return;
  }

  const value = evaluation.score;
  const text = formatScore(value, WeightedYieldConfig.display.mapDecimals);
  const configured = WeightedYieldConfig.display.buildingPosition;
  const anchor = {
    x: numberOrZero(configured?.plotOffset?.x),
    y: numberOrZero(configured?.plotOffset?.y),
    z: numberOrZero(configured?.plotOffset?.z),
  };
  const offset = getScoreBadgeOffset(layer, evaluation);
  backgroundGrid.addSprite(
    location,
    WeightedYieldConfig.display.mapBadgeIcon ?? "hud_mini_lens_btn",
    anchor,
    {
      offset,
      scale: WeightedYieldConfig.display.buildingBadgeScale ?? 1.1,
    },
  );
  const city = globalThis.Cities?.get?.(BuildingPlacementManager.cityID);
  const relativeTextOffset = city?.isTown
    ? configured?.textOffset?.town
    : configured?.textOffset?.city;
  const replacementTextOffset = evaluation.ruralReplacement
    ? city?.isTown
      ? configured?.ruralReplacementTextOffset?.town
      : configured?.ruralReplacementTextOffset?.city
    : null;
  const textOffset = {
    x:
      offset.x +
      numberOrZero(relativeTextOffset?.x) +
      numberOrZero(replacementTextOffset?.x),
    y:
      offset.y +
      numberOrZero(relativeTextOffset?.y) +
      numberOrZero(replacementTextOffset?.y),
  };
  foregroundGrid.addText(location, text, anchor, {
    fonts: ["TitleFont"],
    fill: value < 0
      ? WeightedYieldConfig.display.negativeMapTextColor
      : WeightedYieldConfig.display.mapTextColor,
    stroke: 0,
    fontSize: WeightedYieldConfig.display.weightedMapFontSize,
    faceCamera: true,
    offset: textOffset,
  });
}

function ensureLayerPatched() {
  const layer = LensManager.layers.get(LAYER_NAME);
  if (!layer) return null;
  if (layer[PATCH_FLAG] === WeightedYieldConfig.version) return layer;
  layer[PATCH_FLAG] = WeightedYieldConfig.version;

  layer.getPlacementOptions = function () {
    return buildWeightedPlacementOptions();
  };

  const originalRealize = layer.realizeBuidlingPlacementSprites;
  if (typeof originalRealize === "function") {
    layer.realizeBuidlingPlacementSprites = function (...args) {
      const result = originalRealize.apply(this, args);
      try {
        for (const evaluation of evaluationsByPlot.values()) {
          drawScoreBadge(this, evaluation);
        }
      } catch (error) {
        diagnostic("Building placement score rendering failed.", error);
      }
      return result;
    };
  }
  return layer;
}

function redrawRecommendation() {
  recommendationGroup?.clear?.();
  buildWeightedPlacementOptions();
  for (const plotIndex of bestPlotIndexes) {
    recommendationGroup?.addVFXAtPlot?.(
      VFX_RING,
      plotIndex,
      { x: 0, y: 0, z: 0 },
      { placement: PlacementMode.TERRAIN },
    );
  }
}

function redrawPlacementScores() {
  const layer = ensureLayerPatched();
  if (!layer) return;
  layer.yieldVisualizer?.clear?.();
  layer.adjacenciesSpriteGrid?.clear?.();
  layer.realizeBuidlingPlacementSprites?.();
  redrawRecommendation();
}

function schedulePlacementRedraw() {
  for (const delay of [0, 100, 300]) {
    globalThis.setTimeout?.(() => {
      try {
        const active =
          InterfaceMode.getCurrent?.() === MODE_NAME ||
          InterfaceMode.isInInterfaceMode?.(MODE_NAME);
        if (!active) return;
        redrawPlacementScores();
      } catch (error) {
        diagnostic("Building placement delayed redraw failed.", error);
      }
    }, delay);
  }
}

function wrapAfter(target, methodName, after) {
  const current = target?.[methodName];
  if (typeof current !== "function") return false;
  if (current[PATCH_FLAG] === WeightedYieldConfig.version) return true;
  const wrapped = function (...args) {
    const result = current.apply(this, args);
    try {
      after(this, ...args);
    } catch (error) {
      diagnostic(`${methodName} building hook failed.`, error);
    }
    return result;
  };
  wrapped[PATCH_FLAG] = WeightedYieldConfig.version;
  target[methodName] = wrapped;
  return true;
}

function ensureModePatched() {
  const handler = InterfaceMode.getInterfaceModeHandler?.(MODE_NAME);
  if (!handler) return null;
  wrapAfter(handler, "initialize", () => {
    const cityID = BuildingPlacementManager.cityID;
    if (cityID) {
      WeightedYieldRuntime.refreshBuildingCandidates(
        cityID,
        BuildingPlacementManager.allPlacementData,
      );
    }
    ensureLayerPatched();
    schedulePlacementRedraw();
  });
  wrapAfter(handler, "decorate", () => redrawRecommendation());
  for (const methodName of ["undecorate", "transitionFrom", "reset"]) {
    wrapAfter(handler, methodName, () => recommendationGroup?.clear?.());
  }
  return handler;
}

function scoreLabel(evaluation) {
  if (!evaluation) return "";
  if (evaluation.complete === false) return t("evaluatingRelocation");
  const score = formatScore(
    evaluation.score,
    WeightedYieldConfig.display.panelDecimals,
  );
  if (!evaluation.ruralReplacement) return `${t("weighted")} ${score}`;
  const relocation = formatScore(
    evaluation.relocationScore,
    WeightedYieldConfig.display.panelDecimals,
  );
  const sign = Number(evaluation.relocationScore) >= 0 ? "+" : "";
  return `${t("weighted")} ${score}${parenthesize(
    `${t("relocation")} ${sign}${relocation}`,
  )}`;
}

function createPlacementDetailCard(view) {
  const card = document.createElement("div");
  card.dataset.wysBuildingPlacementDetails = "true";
  card.className = "flex flex-col mx-2 mt-3 mb-4 p-2";
  card.style.border = "1px solid rgba(222, 191, 112, 0.7)";
  card.style.borderRadius = "0.25rem";
  card.style.backgroundColor = "rgba(12, 20, 28, 0.72)";
  card.style.color = "rgb(255, 255, 255)";
  card.style.textShadow = "0 1px 2px black";
  card.style.display = "none";

  const heading = document.createElement("div");
  heading.dataset.wysBuildingPlacementHeading = "true";
  heading.className = "font-title text-secondary text-sm uppercase mb-1";
  heading.textContent = t("buildingEvaluation");

  const breakdown = document.createElement("div");
  breakdown.dataset.wysBuildingPlacementBreakdown = "true";
  breakdown.className = "text-sm leading-normal";
  breakdown.style.whiteSpace = "pre-line";

  const destination = document.createElement("div");
  destination.dataset.wysBuildingPlacementDestination = "true";
  destination.className = "text-sm leading-normal mt-1";

  card.append(heading, breakdown, destination);
  view.appendChild(card);
  return { card, heading, breakdown, destination };
}

class WeightedPlaceBuildingPanel {
  constructor(component) {
    this.component = component;
    this.elements = [];
    this.detailCards = [];
    this.update = () => this.render();
  }

  beforeAttach() {}

  afterAttach() {
    for (const view of [this.component.minimizedDiv, this.component.maximizedDiv]) {
      if (!view) continue;
      let element = view.querySelector("[data-wys-building-score]");
      if (!element) {
        element = document.createElement("div");
        element.dataset.wysBuildingScore = "true";
        element.className = "self-center text-base mt-1 mb-2";
        element.style.padding = "0.25rem 0.55rem";
        element.style.border = "1px solid rgba(222, 191, 112, 0.75)";
        element.style.borderRadius = "0.25rem";
        element.style.backgroundColor = "rgba(12, 20, 28, 0.88)";
        element.style.color = "rgb(255, 255, 255)";
        element.style.fontWeight = "700";
        element.style.textAlign = "center";
        element.style.textShadow = "0 1px 2px black";
        element.style.whiteSpace = "nowrap";
        element.style.display = "none";
        // The expanded panel has one yield bar in Before and another in After.
        // Anchor the compact score to the final Result yield bar. The detailed
        // calculation is a separate card at the bottom of the expanded view.
        const yieldBars = view.querySelectorAll("yield-bar-base");
        const resultYieldBar = yieldBars[yieldBars.length - 1];
        if (resultYieldBar) {
          resultYieldBar.insertAdjacentElement("beforebegin", element);
        } else {
          view.appendChild(element);
        }
      }
      this.elements.push(element);

      if (view === this.component.maximizedDiv) {
        const existing = view.querySelector(
          "[data-wys-building-placement-details]",
        );
        this.detailCards.push(
          existing
            ? {
                card: existing,
                heading: existing.querySelector(
                  "[data-wys-building-placement-heading]",
                ),
                breakdown: existing.querySelector(
                  "[data-wys-building-placement-breakdown]",
                ),
                destination: existing.querySelector(
                  "[data-wys-building-placement-destination]",
                ),
              }
            : createPlacementDetailCard(view),
        );
      }
    }
    window.addEventListener(
      BuildingPlacementSelectedPlotChangedEventName,
      this.update,
    );
    window.addEventListener(
      BuildingPlacementConstructibleChangedEventName,
      this.update,
    );
    this.render();
  }

  beforeDetach() {
    window.removeEventListener(
      BuildingPlacementSelectedPlotChangedEventName,
      this.update,
    );
    window.removeEventListener(
      BuildingPlacementConstructibleChangedEventName,
      this.update,
    );
  }

  afterDetach() {}

  render() {
    const plotIndex = BuildingPlacementManager.selectedPlotIndex;
    if (plotIndex != null && !evaluationsByPlot.has(plotIndex)) {
      buildWeightedPlacementOptions();
    }
    const evaluation = evaluationsByPlot.get(plotIndex);
    const text = scoreLabel(evaluation);
    for (const element of this.elements) {
      element.textContent = text;
      element.style.display = text ? "block" : "none";
    }

    const model =
      evaluation?.complete === false
        ? null
        : getBuildingEvaluationDetailModel(evaluation);
    for (const details of this.detailCards) {
      if (!model) {
        details.card.style.display = "none";
        continue;
      }
      if (details.heading) details.heading.textContent = model.title;
      const breakdownMarkup = model.breakdown.replace(/\n/g, "[N]");
      const stylizedBreakdown =
        globalThis.Locale?.stylize?.(breakdownMarkup);
      if (details.breakdown) {
        if (typeof stylizedBreakdown === "string") {
          details.breakdown.innerHTML = stylizedBreakdown;
        } else {
          details.breakdown.textContent = model.breakdown;
        }
      }
      if (details.destination) {
        details.destination.textContent = model.destination;
        details.destination.style.display = model.destination
          ? "block"
          : "none";
      }
      details.card.style.display = "flex";
    }
  }
}

if (WeightedYieldConfig.buildingValuation.enabled) {
  Controls.decorate(
    "panel-place-building-v2",
    (component) => new WeightedPlaceBuildingPanel(component),
  );
  ensureLayerPatched();
  ensureModePatched();
  globalThis.setTimeout?.(ensureLayerPatched, 0);
  globalThis.setTimeout?.(ensureModePatched, 0);
  globalThis.setTimeout?.(ensureLayerPatched, 1000);
  globalThis.setTimeout?.(ensureModePatched, 1000);
}

export const WeightedBuildingPlacement = {
  getEvaluation(plotIndex) {
    return evaluationsByPlot.get(plotIndex) ?? null;
  },
  refresh: buildWeightedPlacementOptions,
};
