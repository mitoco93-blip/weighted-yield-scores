// Pure resource valuation rules. Game state is supplied by the runtime adapter;
// this module never mutates resource assignments, cities, or units.
const finite = (n) => Number.isFinite(Number(n)) ? Number(n) : 0;
const positive = (n) => Math.max(0, finite(n));
const fraction = (n) => Math.min(1, positive(n));

export function parseRatio(value, expectedLength) {
  const parts = Array.isArray(value) ? value : String(value ?? '').trim().split(/[:：]/);
  if (parts.length !== expectedLength || parts.some(p => String(p).trim() === '')) return null;
  const numbers = parts.map(Number);
  if (numbers.some(n => !Number.isFinite(n) || n < 0)) return null;
  const total = numbers.reduce((a, b) => a + b, 0);
  if (!(total > 0) || !Number.isFinite(total)) return null;
  return numbers.map(n => n / total);
}

export function evaluatePlacement({unassignedScore, placements = [], placementRate = 0.5, hasUnassignedCopy = false}) {
  const unassigned = finite(unassignedScore);
  // Do not optimize the existing allocation. An idle copy takes precedence.
  if (hasUnassignedCopy) return {score: unassigned, unassigned, uplift: 0, destination: null, reason: 'unassigned-copy'};
  let best = null;
  for (const placement of placements) {
    if (placement.eligible === false || !Number.isFinite(placement.score)) continue;
    if (!best || placement.score > best.score) best = placement;
  }
  const uplift = Math.max(0, finite(best?.score) - unassigned) * fraction(placementRate);
  return {score: unassigned + uplift, unassigned, uplift,
    destination: best && best.score > unassigned ? best.cityID : null,
    reason: uplift > 0 ? 'placement' : 'unassigned'};
}

export function militaryShare(units, applies) {
  const seen = new Set();
  let total = 0, affected = 0;
  for (const unit of units ?? []) {
    if (!unit || !unit.isMilitary || unit.isCommander || unit.isSupport) continue;
    // Packed units and map units may be supplied together by an adapter.
    // A stable owner/id key prevents counting the same unit twice.
    if (unit.key != null) {
      if (seen.has(unit.key)) continue;
      seen.add(unit.key);
    }
    total += 1;
    if (applies(unit)) affected += 1;
  }
  return {total, affected, share: total ? affected / total : 0};
}

export function combatValue({units, tags, strength = 1, sciencePerStrength, scienceWeight}) {
  const wanted = new Set(tags);
  const counted = militaryShare(units, unit => (unit.tags ?? []).some(tag => wanted.has(tag)));
  return {...counted, score: counted.share * finite(strength) * positive(sciencePerStrength) * positive(scienceWeight)};
}

export function productionBonus({production, bonusRate, productionShare, targetShare = 1, productionWeight = 1}) {
  return positive(production) * positive(bonusRate) * fraction(productionShare) * fraction(targetShare) * positive(productionWeight);
}

export function incenseValue({unassignedScore, cityProductionScores, activeShare = 1 / 3}) {
  const scores = (cityProductionScores ?? []).filter(Number.isFinite);
  const unassigned = finite(unassignedScore);
  if (!scores.length) return unassigned;
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  // The active-time estimate already accounts for utilization. No extra 50%.
  return fraction(activeShare) * average + (1 - fraction(activeShare)) * unassigned;
}

export function camelValue({unassignedScore, cities = [], slots = 2, hasUnassignedCopy = false}) {
  const unassigned = finite(unassignedScore);
  if (hasUnassignedCopy) return {score: unassigned, destination: null, resources: []};
  let best = {score: unassigned, destination: null, resources: []};
  for (const city of cities) {
    const gainsByType = new Map();
    for (const item of city.unassignedResources ?? []) {
      if (!item.resourceType || !item.eligible || !(item.count > 0)) continue;
      const gain = finite(item.placementScore) - finite(item.unassignedScore);
      // Multiple copies of a type do not create multiple destination options.
      if (gain > 0 && gain > (gainsByType.get(item.resourceType) ?? 0)) gainsByType.set(item.resourceType, gain);
    }
    const chosen = [...gainsByType].sort((a, b) => b[1] - a[1]).slice(0, Math.floor(positive(slots)));
    const score = chosen.reduce((sum, [, gain]) => sum + gain, 0);
    if (score > best.score) best = {score, destination: city.cityID, resources: chosen.map(([type]) => type)};
  }
  // max(U_camel, sum(top positive placement-minus-unassigned gains)).
  // The second branch sacrifices the camel's own unassigned yield.
  return best;
}

export function constructionBonus({remainingCost, baseProduction, bonusRate, existingBonusRate = 0,
  buildProbability = 0.8, currentTurn, usefulUntil, eraEnd, productionWeight = 1}) {
  const horizon = finite(eraEnd) - finite(currentTurn);
  const window = Math.max(0, Math.min(finite(usefulUntil), finite(eraEnd)) - finite(currentTurn));
  if (horizon <= 0 || window <= 0) return 0;
  const before = Math.max(0.000001, 1 + finite(existingBonusRate));
  const after = before + positive(bonusRate);
  const saved = positive(remainingCost) * (1 / before - 1 / after);
  const possible = positive(baseProduction) * window * positive(bonusRate) / after;
  return Math.min(saved, possible) * fraction(buildProbability) * positive(productionWeight) / horizon;
}

export function treasureValue({cargo, rewardPerCargo, spawnInterval, recoveryRate = 0.9}) {
  if (!(Number(spawnInterval) > 0)) return 0;
  return positive(cargo) * positive(rewardPerCargo) * fraction(recoveryRate) / Number(spawnInterval);
}
