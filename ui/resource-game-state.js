// Read-only adapter. Keep native objects out of the pure evaluator and enumerate
// a player's units once, including units packed into army/naval commanders.
export const resourceCityKey = id => id && typeof id === 'object' ? `${id.owner}:${id.id}:${id.type ?? ''}` : String(id);
const read = (fn, fallback = null) => { try { return fn() ?? fallback; } catch { return fallback; } };
const values = table => read(() => Array.from(table), []);
const finite = value => value != null && Number.isFinite(Number(value)) ? Number(value) : null;
const lookup = (table, key, field) => read(() => table.lookup(key)) ?? values(table).find(row => row[field] === key || row.$hash === key || row.$index === key);


// Match the engine's no-resource sentinel BEFORE any database lookup. A table's
// array position is not evidence of resource identity (especially at zero).
export function resolveResourceDefinition(rawType, api = globalThis) {
  const table = api.GameInfo?.Resources;
  const none = api.ResourceTypes?.NO_RESOURCE;
  if (!table || rawType == null || rawType === -1 || rawType === none ||
      rawType === '' || typeof rawType === 'boolean' ||
      (typeof rawType === 'number' && !Number.isFinite(rawType))) return null;
  const matches = row => Boolean(row?.ResourceType) &&
    row.ResourceType !== 'NO_RESOURCE' && row.ResourceType !== 'RESOURCE_NONE' &&
    (row.$hash === rawType || row.$index === rawType || row.ResourceType === rawType);
  const found = read(() => table.lookup(rawType));
  if (matches(found)) return found;
  return values(table).find(matches) ?? null;
}

export function readResourceSnapshot(api = globalThis) {
  const {GameInfo, Game, GameContext, Players, Units, Armies, Constructibles} = api;
  const player = read(() => Players.get(GameContext.localPlayerID));
  if (!player || !GameInfo) return null;
  const era = ['antiquity','exploration','modern'].find(name => read(() => Game.getHash(`AGE_${name.toUpperCase()}`)) === Game?.age);
  if (!era) return null;
  const tags = new Map();
  for (const row of values(GameInfo.TypeTags)) {
    if (!tags.has(row.Type)) tags.set(row.Type, []);
    tags.get(row.Type).push(row.Tag);
  }
  const definitions = Object.fromEntries(values(GameInfo.Resources).map(row => [row.ResourceType,row]));
  const yields = values(GameInfo.Yields);
  const unassignedRecord = {};
  for (const y of yields) {
    const amount = finite(read(() => player.Resources.getUnassignedResourceYieldBonus(y.$hash)));
    if (amount != null) unassignedRecord[y.YieldType] = amount;
  }
  const cities = values(read(() => player.Cities.getCities(), [] )).map(city => {
    const buildings = values(read(() => city.Constructibles.getIds(), [])).map(id => {
      const instance = read(() => Constructibles.getByComponentID(id));
      const def = lookup(GameInfo.Constructibles, instance?.type, 'ConstructibleType');
      return def ? {type:def.ConstructibleType, tags:tags.get(def.ConstructibleType) ?? [], damaged:Boolean(instance?.damaged)} : null;
    }).filter(Boolean);
    const output = {};
    for (const y of yields) {
      const index = api.YieldTypes?.[y.YieldType] ?? y.$index;
      // Gross food, rather than food after consumption, is multiplied by growth
      // and yield percentage effects. getYield is also the existing deficit UI's source.
      output[y.YieldType] = finite(read(() => city.Yields.getYield(index))) ?? 0;
    }
    const remainingCosts = {};
    for (const type of era === 'modern' ? ['BUILDING_FACTORY','BUILDING_RAIL_STATION','BUILDING_PORT'] : []) {
      if (buildings.some(b => b.type === type)) { remainingCosts[type] = 0; continue; }
      const def = lookup(GameInfo.Constructibles,type,'ConstructibleType');
      if (!def) continue;
      const cost = finite(read(() => city.Production.getConstructibleProductionCost(def.ConstructibleType)));
      // Deliberately ignore partial construction (user preference, 2026-09-28).
      // Unbuilt targets use the full current cost; completed targets use zero above.
      if (cost != null && cost >= 0) remainingCosts[type] = cost;
    }
    const assigned = read(() => city.Resources.getAssignedResources(), []);
    return {key:resourceCityKey(city.id), id:city.id, native:city, name:city.name, isTown:Boolean(city.isTown),
      isCapital:Boolean(city.isCapital), isDistant:read(() => player.isDistantLands(city.location)),
      connected:read(() => city.Trade.isInTradeNetwork(),false),
      assignable:typeof city.Resources?.getAssignedResourcesCap === 'function',
      hasFactory:buildings.some(b => b.type === 'BUILDING_FACTORY' && !b.damaged),
      yields:output,buildings,remainingCosts,assigned};
  });
  const identity = item => `${Boolean(item.isOffMap)}:${item.value}`;
  const assigned = new Set(cities.flatMap(c => c.assigned.map(identity)));
  const counts = {}, unassignedCounts = {}, unassignedOrigins = {};
  for (const resource of read(() => player.Resources.getResources(), [])) {
    const def = resolveResourceDefinition(resource.uniqueResource?.resource, api);
    if (!def) continue;
    const type = def.ResourceType;
    counts[type] = (counts[type] ?? 0) + 1;
    if (!assigned.has(identity(resource)) && !['RESOURCECLASS_EMPIRE','RESOURCECLASS_TREASURE'].includes(def.ResourceClassType)) {
      unassignedCounts[type] = (unassignedCounts[type] ?? 0) + 1;
      const origin = resource.isOffMap ? null : read(() => Game.Resources.getOriginCity(resource.value));
      (unassignedOrigins[type] ??= []).push(cities.find(c => c.key === resourceCityKey(origin)));
    }
  }
  const units = [], seen = new Set();
  const unitIDs = read(() => player.Units.getUnitIds());
  const pending = [...(unitIDs ?? [])];
  for (let i=0;i<pending.length;i++) {
    const id = pending[i], key = resourceCityKey(id);
    if (seen.has(key)) continue;
    seen.add(key);
    const unit = read(() => Units.get(id));
    if (!unit) continue;
    const def = lookup(GameInfo.Units,unit.type,'UnitType');
    units.push({key,isMilitary:def?.CoreClass === 'CORE_CLASS_MILITARY',
      isSupport:def?.CoreClass === 'CORE_CLASS_SUPPORT',isCommander:Boolean(unit.isCommanderUnit),
      tags:tags.get(def?.UnitType) ?? []});
    if (unit.isCommanderUnit) pending.push(...read(() => Armies.get(unit.armyId).getUnitIds(), []));
  }
  return {age:era,cities,definitions,counts,unassignedCounts,unassignedOrigins,unassignedRecord,units,
    unitsKnown:unitIDs != null,currentTurn:finite(Game.turn),
    speedScale:finite(read(() => Game.Diplomacy.modifyByGameSpeed(100))) / 100 || null};
}
