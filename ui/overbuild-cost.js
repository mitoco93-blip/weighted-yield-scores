// Base-game overbuild bonuses, verified against the shipped GameEffects XML.
// Active policies are queried in every slot: Commune may be inherited as a
// tradition in the Modern Age. These are production bonuses, not cost discounts.
const POLICY_BONUSES = {
  TRADITION_COMMUNE: 20,
  TRADITION_CIVIL_ENGINEERING: 30,
};
const GOVERNMENT_BONUSES = { GOVERNMENT_PLUTOCRACY: 20 };
const SLOT_NAMES = ['POLICY_CULTURE_SLOT','TRADITION_CULTURE_SLOT','CRISIS_CULTURE_SLOT'];

export function readOverbuildBonus(city, api = globalThis) {
  try {
    const owner = city?.owner ?? city?.id?.owner;
    if (owner == null) return {known:false, percent:0};
    const culture = api.Players?.get?.(owner)?.Culture;
    if (!culture || typeof culture.getGovernmentType !== 'function' ||
        typeof culture.getActiveTraditions !== 'function') return {known:false, percent:0};
    const governmentType = culture.getGovernmentType();
    if (governmentType == null) return {known:false, percent:0};
    const government = api.GameInfo?.Governments?.lookup?.(governmentType);
    if (governmentType !== -1 && !government) return {known:false, percent:0};
    let percent = GOVERNMENT_BONUSES[government?.GovernmentType] ?? 0;
    const sources = percent ? [{name:government.Name, percent}] : [];
    const seen = new Set();
    for (const name of SLOT_NAMES) {
      const slot = api.CultureSlotTypes?.[name];
      if (slot == null) return {known:false, percent:0};
      const active = culture.getActiveTraditions(slot);
      if (!Array.isArray(active)) return {known:false, percent:0};
      for (const id of active) {
        const definition = api.GameInfo?.Traditions?.lookup?.(id);
        if (!definition) return {known:false, percent:0};
        const type = definition.TraditionType;
        if (seen.has(type)) continue;
        seen.add(type);
        const amount = POLICY_BONUSES[type] ?? 0;
        if (amount) { percent += amount; sources.push({name:definition.Name, percent:amount}); }
      }
    }
    return {known:true, percent, sources};
  } catch { return {known:false, percent:0}; }
}

export function isBuildingOverbuild(constructible, placement, api = globalThis) {
  if (constructible?.ConstructibleClass !== 'BUILDING') return false;
  const index = placement?.overbuiltConstructibleID;
  if (index == null || index === '' || typeof index === 'boolean' || !Number.isInteger(Number(index)) || Number(index)<0) return false;
  // This is a DB collection index, never an instance ID or a type hash.
  for (const row of api.GameInfo?.Constructibles ?? []) {
    if (row?.$index != null && Number(row.$index) === Number(index)) return row.ConstructibleClass === 'BUILDING';
  }
  return false;
}

// Efficiency convention: normalize the extra production to an equivalent cost.
// Keep the actual cost unchanged; the game still spends that cost in production.
export function applyOverbuildCost(cost, {city,constructible,placement,isRepairing=false,api=globalThis}={}) {
  if (cost.isPurchasing || isRepairing || !isBuildingOverbuild(constructible,placement,api)) return cost;
  const bonus=readOverbuildBonus(city,api);
  if (!bonus.known) return {...cost,overbuildBonusUnavailable:true};
  if (!(bonus.percent>0) || !(cost.efficiencyCost>0)) return cost;
  return {...cost,overbuildBonusPercent:bonus.percent,overbuildBonusSources:bonus.sources,
    efficiencyCost:cost.efficiencyCost/(1+bonus.percent/100)};
}

