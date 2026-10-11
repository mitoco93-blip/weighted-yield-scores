import { parseRatio } from './resource-valuation.js';

// Separate production plans from military ownership. Changing the army must
// never change these estimates of future production spending.
export const RESOURCE_SETTING_DEFAULTS = Object.freeze({
  resourcePlacementPercent: 50,
  resourceCelebrationPercent: 50,
  resourceTreasureRecoveryPercent: 90,
  resourceConstructionPercent: 80,
  resourceConstructionUsefulTurn: 60,
  resourceEraEndTurn: 80,
  resourceCombatScienceAntiquity: 2,
  resourceCombatScienceExploration: 4,
  resourceCombatScienceModern: 6,
  resourceHealingScience: 7.5,
  resourceProductionAntiquity: '1:1:1',
  resourceProductionExploration: '1:1:1',
  resourceProductionModern: '1:1:1',
  resourceNavyAntiquity: '1:9',
  resourceNavyExploration: '1:3',
  resourceCivilianModern: '1:9',
  resourceMilitaryModern: '5:4:1',
  resourceWonderBiomesAntiquity: '1:1',
  resourceIncenseActive: '1:3',
});

const RATIO_LENGTHS = Object.freeze({
  resourceProductionAntiquity: 3,
  resourceProductionExploration: 3,
  resourceProductionModern: 3,
  resourceNavyAntiquity: 2,
  resourceNavyExploration: 2,
  resourceCivilianModern: 2,
  resourceMilitaryModern: 3,
  resourceWonderBiomesAntiquity: 2,
  resourceIncenseActive: 2,
});

export function normalizeResourceSetting(key, value, previous = RESOURCE_SETTING_DEFAULTS[key]) {
  if (!(key in RESOURCE_SETTING_DEFAULTS)) return undefined;
  const length = RATIO_LENGTHS[key];
  if (length) {
    if (!parseRatio(value, length)) return previous;
    const parts = Array.isArray(value) ? value : String(value).split(/[:：]/);
    // Keep the entered relative numbers rather than saving rounded fractions.
    return parts.map(Number).join(':');
  }
  if (value == null || String(value).trim() === '') return previous;
  const n = Number(value);
  const maximum = key.endsWith('Percent') ? 100 : 10000;
  const minimum = key.endsWith('Turn') ? 1 : 0;
  return Number.isFinite(n) && n >= minimum && n <= maximum ? n : previous;
}

export function getProductionShares(age, read = key => RESOURCE_SETTING_DEFAULTS[key]) {
  const suffix = {antiquity:'Antiquity',exploration:'Exploration',modern:'Modern'}[age];
  if (!suffix) throw new RangeError('Unknown resource valuation age');
  const ratio = key => parseRatio(read(key), RATIO_LENGTHS[key]) ?? parseRatio(RESOURCE_SETTING_DEFAULTS[key], RATIO_LENGTHS[key]);
  const [buildings, wonders, units] = ratio(`resourceProduction${suffix}`);
  if (age !== 'modern') {
    const [naval] = ratio(`resourceNavy${suffix}`);
    return {buildings,wonders,units,naval,other:1-naval};
  }
  const [civilian] = ratio('resourceCivilianModern');
  const [army, navy, air] = ratio('resourceMilitaryModern');
  const military = 1-civilian;
  // The configurable civilian-production bucket represents the land support
  // units manually trained in Modern (e.g. Explorers), not generated convoys.
  return {buildings,wonders,units,civilian,army:military*army,
    naval:military*navy,air:military*air,land:military*army+civilian};
}
