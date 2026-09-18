import { PlacePopulation } from "/base-standard/ui/place-population/model-place-population.js";
import { WeightedYieldConfig } from "./config.js";
import { getPopulationEvaluationDetailModel } from "./population-details.js";
import { t } from "./i18n.js";
import { formatScore } from "./scorer.js";
import { WeightedYieldRuntime } from "./runtime.js";

const EVENT_NAME = "wys-weighted-score-changed";
const PATCH_FLAG = "__wysWeightedPlacePopulationPatched";
const prototype = Object.getPrototypeOf(PlacePopulation);

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

PlacePopulation.wysScoreText = "";
PlacePopulation.wysScoreKind = "";
PlacePopulation.wysScoreEvaluation = null;

function setScoreText(text, kind = "", scored = null) {
  PlacePopulation.wysScoreText = text;
  PlacePopulation.wysScoreKind = kind;
  PlacePopulation.wysScoreEvaluation = scored;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { text, kind, scored } }),
  );
}

function panelVersionLabel() {
  return WeightedYieldConfig.display.showVersionInPanel
    ? ` [v${WeightedYieldConfig.version}]`
    : "";
}

function foodValuationLabel() {
  const valuation = WeightedYieldRuntime.state.foodValuation;
  if (!valuation) return "";
  return t("foodInline", { value: formatScore(valuation.weight, 2) });
}

function weightedScoreLabel(scored) {
  const marker = scored.approximate ? t("approximate") : "";
  return `${t("weighted")} ${marker}${formatScore(scored.score, WeightedYieldConfig.display.panelDecimals)}${panelVersionLabel()}${foodValuationLabel()}`;
}

function updateScoreFromModel(model) {
  if (!WeightedYieldConfig.display.showHoverPanelScore) {
    setScoreText();
    return;
  }

  // Improvement mode can retain stale specialist hover data. Check the active
  // constructible first so an expansion tile is never mislabeled as specialist.
  const plotIndex = model.hoveredPlotIndex;
  if (plotIndex != null && model.constructibleToBeBuiltOnExpand) {
    if (!model.getExpandPlots?.().some(candidate => candidate.plotIndex === plotIndex)) {
      setScoreText();
      return;
    }
    const scored = WeightedYieldRuntime.getHoveredImprovementScore(
      plotIndex,
      model.afterYieldDeltasJSONd,
    );
    if (scored) {
      setScoreText(weightedScoreLabel(scored), "improvement", scored);
      return;
    }
  }

  const workerInfo = model.hoveredPlotWorkerPlacementInfo;
  if (workerInfo && workerInfo.PlotIndex != null) {
    const scored = WeightedYieldRuntime.getSpecialistScore(workerInfo.PlotIndex, workerInfo);
    if (scored) {
      setScoreText(weightedScoreLabel(scored), "specialist", scored);
      return;
    }
  }

  setScoreText();
}

if (!prototype[PATCH_FLAG]) {
  prototype[PATCH_FLAG] = true;

  // Expansion candidates are populated by this method. Refreshing here is
  // essential: PlotWorkersManager is reliable for specialist mode but is not
  // guaranteed to update when the player opens the improvement picker.
  const originalUpdateExpandPlots = prototype.updateExpandPlots;
  if (typeof originalUpdateExpandPlots === "function") {
    prototype.updateExpandPlots = function (cityID, ...args) {
      // Use exactly the list produced by the native command, including an
      // empty list on failure. Never retain building-valuation fallback plots
      // or query EXPAND a second time with a potentially different snapshot.
      const refresh = () => {
        const candidates = this.getExpandPlots?.() ?? [];
        WeightedYieldRuntime.refreshImprovements(cityID, {
          Plots: candidates.map(candidate => candidate.plotIndex),
          ConstructibleTypes: candidates.map(candidate => candidate.constructibleType),
        });
      };
      const result = originalUpdateExpandPlots.call(this, cityID, ...args);
      if (typeof result?.then === "function") {
        result.then(refresh, error => diagnostic("updateExpandPlots promise failed.", error));
      } else {
        refresh();
      }
      return result;
    };
  } else {
    diagnostic("PlacePopulation.updateExpandPlots was not found.");
  }

  // Migrants enter via UnitCommands.RESETTLE, not the city's EXPAND command.
  // Read the list the native model has just built so every eligible plot is
  // scored before the acquire-tile lens draws (hover can refine it afterward).
  const originalResettle = prototype.updateExpandPlotsForResettle;
  if (typeof originalResettle === "function") {
    prototype.updateExpandPlotsForResettle = function (unitID, ...args) {
      const refresh = () => {
        try {
          const location = globalThis.Units?.get?.(unitID)?.location;
          if (!location || location.x < 0 || location.y < 0) return;
          // Match AcquireTileInterfaceMode.getUnitCityID. Never treat a unit
          // component ID or a previously selected city as the receiving city.
          const cityID = globalThis.MapCities?.getCity?.(location.x, location.y);
          if (!cityID || !globalThis.Cities?.get?.(cityID)) return;
          const candidates = this.getExpandPlots?.() ?? this.expandPlots;
          if (!Array.isArray(candidates)) return;
          WeightedYieldRuntime.refreshImprovements(cityID, {
            Plots: candidates.map((candidate) => candidate.plotIndex),
            ConstructibleTypes: candidates.map((candidate) => candidate.constructibleType),
          });
        } catch (error) {
          diagnostic("Resettlement candidate score refresh failed.", error);
        }
      };
      const result = originalResettle.call(this, unitID, ...args);
      if (typeof result?.then === "function") {
        result.then(refresh, (error) => diagnostic("Resettlement candidate update failed.", error));
      } else {
        refresh();
      }
      return result;
    };
  } else {
    diagnostic("PlacePopulation.updateExpandPlotsForResettle was not found.");
  }
  const originalUpdate = prototype.update;
  if (typeof originalUpdate === "function") {
    prototype.update = function (...args) {
      const result = originalUpdate.apply(this, args);
      updateScoreFromModel(this);
      return result;
    };
  }
}

function createPopulationDetailCard(view) {
  const card = document.createElement("div");
  card.dataset.wysPopulationDetails = "true";
  card.className = "flex flex-col mx-2 mt-3 mb-4 p-2";
  card.style.border = "1px solid rgba(222, 191, 112, 0.7)";
  card.style.borderRadius = "0.25rem";
  card.style.backgroundColor = "rgba(12, 20, 28, 0.72)";
  card.style.color = "rgb(255, 255, 255)";
  card.style.textShadow = "0 1px 2px black";
  card.style.display = "none";

  const heading = document.createElement("div");
  heading.dataset.wysPopulationHeading = "true";
  heading.className = "font-title text-secondary text-sm uppercase mb-1";

  const breakdown = document.createElement("div");
  breakdown.dataset.wysPopulationBreakdown = "true";
  breakdown.className = "text-sm leading-normal";
  breakdown.style.whiteSpace = "pre-line";

  card.append(heading, breakdown);
  view.appendChild(card);
  return { card, heading, breakdown };
}

class WeightedPlacePopulationPanel {
  constructor(component) {
    this.component = component;
    this.scoreElements = [];
    this.detailCards = [];
    this.onScoreChanged = (event) => this.render(
      event.detail?.text ?? "",
      event.detail?.kind ?? "",
      event.detail?.scored ?? null,
    );
  }

  beforeAttach() {}

  afterAttach() {
    const component = this.component;
    const views = [
      component.improvementMinimizedContainer,
      component.improvementMaximizedContainer,
      component.specialistMinimizedContainer,
      component.specialistMaximizedContainer,
    ].filter(Boolean);

    for (const view of views) {
      if (view.querySelector("[data-wys-weighted-score]")) continue;

      const element = document.createElement("div");
      element.setAttribute("data-wys-weighted-score", "true");
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

      const resultsHeading = view.querySelector(
        '[data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS"]',
      );
      const results = resultsHeading?.parentElement;
      if (results) results.insertAdjacentElement("afterend", element);
      else view.insertBefore(element, view.firstChild);

      this.scoreElements.push(element);
    }

    for (const view of [
      component.improvementMaximizedContainer,
      component.specialistMaximizedContainer,
    ].filter(Boolean)) {
      const existing = view.querySelector("[data-wys-population-details]");
      this.detailCards.push(
        existing
          ? {
              card: existing,
              heading: existing.querySelector("[data-wys-population-heading]"),
              breakdown: existing.querySelector(
                "[data-wys-population-breakdown]",
              ),
            }
          : createPopulationDetailCard(view),
      );
    }

    window.addEventListener(EVENT_NAME, this.onScoreChanged);
    this.render(
      PlacePopulation.wysScoreText,
      PlacePopulation.wysScoreKind,
      PlacePopulation.wysScoreEvaluation,
    );
  }

  beforeDetach() {
    window.removeEventListener(EVENT_NAME, this.onScoreChanged);
  }

  afterDetach() {}

  render(text, kind = "", scored = null) {
    for (const element of this.scoreElements) {
      element.textContent = text;
      element.style.display = text ? "block" : "none";
    }

    const model = getPopulationEvaluationDetailModel(
      scored,
      kind,
      WeightedYieldRuntime.state.foodValuation?.weight,
    );
    for (const details of this.detailCards) {
      if (!model) {
        details.card.style.display = "none";
        continue;
      }
      if (details.heading) details.heading.textContent = model.title;
      const breakdownMarkup = model.breakdown.replace(/\n/g, "[N]");
      const stylizedBreakdown = globalThis.Locale?.stylize?.(breakdownMarkup);
      if (details.breakdown) {
        if (typeof stylizedBreakdown === "string") {
          details.breakdown.innerHTML = stylizedBreakdown;
        } else {
          details.breakdown.textContent = model.breakdown;
        }
      }
      details.card.style.display = "flex";
    }
  }
}

Controls.decorate(
  "panel-place-population",
  (component) => new WeightedPlacePopulationPanel(component),
);
