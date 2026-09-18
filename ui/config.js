import { WeightedYieldSettings } from "./settings.js";

/** Shared runtime configuration for Weighted Yield Scores. */
export const WeightedYieldConfig = {
  version: "0.4.0-beta.2",
  baselineYieldType: "YIELD_PRODUCTION",

  // A town converts Production into Gold. Keep the common production-
  // equivalent display unit, but value each Production point at the Gold rate
  // while scoring town improvement choices.
  town: {
    productionUsesGoldRate: true,
  },

  // Food is valued per settlement. The 1.4.x growth curve supplies the prior,
  // while the current threshold, remaining turns and best nearby candidates
  // estimate the value of accelerating the next few citizens.
  foodValuation: {
    get enabled() {
      return WeightedYieldSettings.useDynamicFood;
    },
    candidateCount: 3,
    horizonTurns: 60,
    maximumGrowths: 3,
    minimumWeight: 0.15,
    maximumWeight: 3,
  },

  // Positive Happiness keeps its normal fixed weight. When a candidate
  // changes a settlement's negative Happiness penalty, add the
  // production-equivalent value of the non-Food yields restored or lost.
  happinessValuation: {
    enabled: true,
    penaltyPerPoint: 0.05,
    maximumPenalty: 0.8,
    affectedYieldTypes: [
      "YIELD_DIPLOMACY",
      "YIELD_PRODUCTION",
      "YIELD_SCIENCE",
      "YIELD_CULTURE",
      "YIELD_GOLD",
    ],
  },

  // A newly acquired assignable resource starts out unassigned. Civ VII's
  // player resource API supplies the per-resource Gold/Happiness (and any
  // future yield) bonus for the current Age and active rules. Empire and
  // Treasure resources do not receive that bonus in the base-game UI.
  resourceValuation: {
    enabled: true,
    excludedClasses: ["RESOURCECLASS_EMPIRE", "RESOURCECLASS_TREASURE"],
  },

  // Improvement choices score the estimated total output of the resulting tile.
  improvement: {
    get weights() {
      return WeightedYieldSettings.getWeights();
    },
  },

  // Specialist choices score the net change caused by assigning one specialist.
  specialist: {
    get weights() {
      return WeightedYieldSettings.getWeights();
    },
  },

  // Building placement uses the same comparison unit. The game-supplied
  // placement delta already includes adjacency, warehouse effects, the
  // overbuilt tile and maintenance; this profile only changes its valuation.
  building: {
    get weights() {
      return WeightedYieldSettings.getWeights();
    },
  },

  buildingValuation: {
    enabled: true,
    // Production mode deliberately excludes specialist slots created by the
    // unfinished building. Purchase-mode simulation of a not-yet-existing
    // specialist slot is not exposed by Civ VII 1.4's UI API, so v0.3.2 uses
    // the best currently legal destination in both modes.
    includeCurrentSpecialists: true,
    sortProductionList: true,
    showPlacementScores: true,
    // Both Production and Purchase use this same dimensionless comparison:
    // best weighted placement score / underlying Production cost. Multiplying
    // by 10,000 makes the compact list value a readable integer without
    // changing its ordering.
    priorityScale: 10000,
  },

  display: {
    showMapScores: true,
    showHoverPanelScore: true,
    showVersionInPanel: false,
    mapDecimals: 1,
    panelDecimals: 2,

    // Keep the map badge to one weighted value; the game's ordinary total
    // remains visible at left.
    mapBadgeIcon: "hud_mini_lens_btn",
    // Building placement deliberately reuses the same native badge that has
    // already proved stable for the other map scores.
    buildingBadgeScale: 1.1,
    weightedMapFontSize: 6,
    specialistMinimumMapFontSize: 5,
    specialistLongValueMinimumMapFontSize: 4.5,
    improvementBadgeScale: 1.16,
    mapTextColor: 0xffffffff,
    negativeMapTextColor: 0xff7a7aff,

    // Draw the specialist score inside the next empty native specialist pip.
    // x/y are optional screen-space adjustments after the game's own layout.
    specialistPipTextOffset: { x: 0, y: 0 },

    // Use the same plot anchor as the game's improvement-yield row. Only the
    // final x/y adjustment is screen-space, so zoom and camera angle do not
    // push the badge away from its tile.
    improvementPosition: {
      plotOffset: { x: 0, y: -10, z: 0 },
      screenOffset: { x: 0, y: -10 },
    },

    // Building placement uses the game's native gain/loss pill rows. The
    // score follows the right edge of the row where it is drawn. This
    // keeps a wider loss row below from pushing a gain-row score outward.
    buildingPosition: {
      plotOffset: { x: 0, y: 0, z: 0 },
      screenOffset: { x: 0, y: 0 },
      textOffset: {
        city: { x: 0, y: -0.5 },
        town: { x: 0, y: -0.2 },
      },
      // Additional text-only correction for plots that replace a rural
      // district. City/town values can be adjusted independently from
      // ordinary building-placement labels.
      ruralReplacementTextOffset: {
        city: { x: 0, y: 0.25 },
        town: { x: 0, y: 0.2 },
      },
      horizontalGap: 12,
      gainRowY: 6,
      lossRowY: -10,
    },
  },

  // Logs only warnings that help diagnose UI changes after a game update.
  diagnostics: true,
};

