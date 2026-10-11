import { RESOURCE_EFFECTS } from './resource-catalog.js';
import { WeightedYieldSettings as settings } from './settings.js';
import { getProductionShares } from './resource-settings.js';
import { parseRatio, evaluatePlacement, combatValue, incenseValue, camelValue, constructionBonus } from './resource-valuation.js';

// Current resource combat strength cap, confirmed by the user (2026-09-28).
// This is a rules constant, not an inferred native GlobalParameters entry.
const RESOURCE_COMBAT_STRENGTH_CAP = 6;

const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const add = (record, type, value) => { record[type] = n(record[type]) + n(value); };
const excluded = new Set(['RESOURCE_LAPIS_LAZULI', 'RESOURCE_LAPIS', 'RESOURCE_CLOVES', 'RESOURCE_NICKEL']);
export const resourceEffectKey = row => `${row.era}:${row.args.ResourceType}:${row.id}`;

// The snapshot is immutable game input for one UI refresh. No assignment search,
// game commands, or cross-refresh result cache lives in this evaluator.
export function createResourceEvaluator(snapshot, { scoreCity, scoreGlobal, read = key => settings.get(key), effectScale = key => settings.getResourceEffectScale(key) } = {}) {
  const age = snapshot.age;
  const suffix = {antiquity:'Antiquity', exploration:'Exploration', modern:'Modern'}[age];
  const shares = getProductionShares(age, read);
  const rows = RESOURCE_EFFECTS.filter(row => row.era === age);
  const cities = snapshot.cities ?? [];
  const cache = new Map();
  const scales = new Map();
  const getScale = key => { if (!scales.has(key)) scales.set(key,effectScale(key)); return scales.get(key); };
  const scale = row => getScale(resourceEffectKey(row));
  const specialScale = (type, id) => getScale(`${age}:${type}:${id}`);
  const globalScore = record => n(scoreGlobal(record));
  const cityScore = (city, record) => n(scoreCity(city, record));
  const unassigned = globalScore(snapshot.unassignedRecord ?? {});
  const forType = type => rows.filter(row => row.args.ResourceType === type);

  function matches(row, city) {
    if (row.collection === 'COLLECTION_ALL_CAPITAL_CITIES' && !city?.isCapital) return false;
    return row.requirements.every(req => {
      let yes;
      switch (req.type) {
        case 'REQUIREMENT_CITY_IS_TOWN': yes = city?.isTown; break;
        case 'REQUIREMENT_CITY_IS_CITY':
        case 'REQUIREMENT_CITY_HAS_BUILD_QUEUE': yes = city && !city.isTown; break;
        case 'REQUIREMENT_CITY_IS_CAPITAL': yes = city?.isCapital; break;
        case 'REQUIREMENT_CITY_IS_DISTANT_LANDS': yes = city?.isDistant; break;
        case 'REQUIREMENT_CITY_HAS_BUILDING': yes = city?.buildings?.some(b => b.type === req.args.BuildingType); break;
        case 'REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE': return true; // configurable time share, not current phase
        case 'REQUIREMENT_UNIT_TAG_MATCHES': return true; // evaluated against each owned unit below
        default: return false;
      }
      if (yes == null) return false;
      return req.inverse ? !yes : Boolean(yes);
    });
  }

  function globalEffect(row) {
    return row.args.Empire === 'true' || row.args.GlobalSlots === 'true' ||
      /AVAILABLE_RESOURCE_TYPE|PLAYER_ADJUST|PER_SLOTTED_RESOURCE|UNIT_ADJUST|PRODUCTION_EFFICIENCY/.test(row.effect);
  }

  function effectRecord(row, city, issues) {
    const a = row.args, e = row.effect, record = {};
    if (!matches(row, city)) return record;
    let amount = n(a.Amount ?? a.Percent) * scale(row);
    if (!amount) return record;
    if (row.requirements.some(r => r.type === 'REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE')) amount *= n(read('resourceCelebrationPercent')) / 100;
    if (/ADJUST_YIELD_PER_RESOURCE$|ADJUST_YIELD_PER_AVAILABLE_RESOURCE_TYPE$|ADJUST_YIELD_PER_RESOURCE_TYPE$|ADJUST_PLAYER_YIELD_PER_SLOTTED_RESOURCE$/.test(e)) {
      // Cocoa's game modifier omits PercentMultiplier although its advertised
      // factory effect is +3%. Keep that explicit resource-specific interpretation.
      const percent = a.PercentMultiplier === 'true' || (age === 'modern' && a.ResourceType === 'RESOURCE_COCOA');
      add(record, a.YieldType, percent ? n(city?.yields?.[a.YieldType]) * amount / 100 : amount);
    } else if (e.endsWith('ADJUST_CONSTRUCTIBLE_YIELD_PER_RESOURCE')) {
      const count = (city.buildings ?? []).filter(b => a.ConstructibleType ? b.type === a.ConstructibleType : b.tags?.includes(a.Tag)).length;
      add(record, a.YieldType, amount * count);
    } else if (e.endsWith('ADJUST_GROWTH_PER_RESOURCE')) {
      add(record, 'YIELD_FOOD', Math.max(0, n(city.yields?.YIELD_FOOD)) * amount / 100);
    } else if (/ADJUST_UNIT_PRODUCTION_PER_(RESOURCE|SLOTTED_RESOURCE)$/.test(e)) {
      if (city.isTown) return record;
      let target = 1;
      if (a.Domain === 'DOMAIN_SEA') target = shares.naval;
      else if (a.Domain === 'DOMAIN_LAND') target = shares.land ?? shares.other;
      else if (a.UnitClass === 'UNIT_CLASS_NON_COMBAT') target = shares.civilian ?? 0;
      else if (a.UnitTag === 'UNIT_CLASS_RELIGIOUS') return record; // incense's dedicated time model
      add(record, 'YIELD_PRODUCTION', Math.max(0, n(city.yields.YIELD_PRODUCTION)) * amount / 100 * shares.units * target);
    } else if (e.endsWith('ADJUST_BIOME_WONDER_PRODUCTION_PER_RESOURCE')) {
      if (city.isTown) return record;
      const biomeRatio = parseRatio(read('resourceWonderBiomesAntiquity'), 2) ?? [.5,.5];
      const share = age === 'antiquity' && a.ResourceType !== 'RESOURCE_LIMESTONE'
        ? biomeRatio[a.ResourceType === 'RESOURCE_MARBLE' ? 0 : 1] : 1;
      // The data has one row per biome. Each group partitions the SAME wonder
      // spending; summing six copies would overvalue all-biome marble sixfold.
      const group = forType(a.ResourceType).filter(x => x.effect === e);
      add(record, 'YIELD_PRODUCTION', Math.max(0, n(city.yields.YIELD_PRODUCTION)) * amount / 100 * shares.wonders * share / group.length);
    } else if (/ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_(RESOURCE|SLOTTED_RESOURCE)$|ADJUST_BUILDING_PRODUCTION_EFFICIENCY_PER_RESOURCE_TYPE$/.test(e)) {
      if (city.isTown) return record;
      const building = a.ConstructibleType ?? a.BuildingType;
      if (building === 'BUILDING_TEMPLE' && a.ResourceType === 'RESOURCE_INCENSE') return record;
      if (building) {
        if (city.buildings?.some(b => b.type === building)) return record;
        const remainingCost = city.remainingCosts?.[building];
        if (remainingCost == null || snapshot.currentTurn == null || snapshot.speedScale == null) {
          issues.add('construction-data'); return record;
        }
        const saved = constructionBonus({remainingCost, baseProduction:city.yields.YIELD_PRODUCTION,
          bonusRate:n(a.Amount ?? a.Percent) / 100, existingBonusRate:n(snapshot.counts?.[a.ResourceType]) * n(a.Amount ?? a.Percent) / 100, buildProbability:n(read('resourceConstructionPercent')) / 100,
          currentTurn:snapshot.currentTurn, usefulUntil:n(read('resourceConstructionUsefulTurn')) * snapshot.speedScale,
          eraEnd:n(read('resourceEraEndTurn')) * snapshot.speedScale});
        add(record, 'YIELD_PRODUCTION', saved * scale(row));
      } else {
        const share = a.ConstructibleClass === 'WONDER' ? shares.wonders : shares.buildings;
        add(record, 'YIELD_PRODUCTION', Math.max(0, n(city.yields.YIELD_PRODUCTION)) * amount / 100 * share);
      }
    } else if (!/UNIT_ADJUST_COMBAT|UNIT_ADJUST_HEAL/.test(e)) issues.add(row.id);
    return record;
  }

  function effectsScore(effectRows, recipients, issues, cappedCombatEffects = [], missingCombatTargets = []) {
    // Combine happiness changes first so threshold recovery is not counted once
    // per modifier. Player yields are global and must not be repeated per city.
    const globalRecord = {}, cityRecords = new Map(recipients.map(c => [c.key, {}]));
    const actualHappiness = new Map();
    let extra = 0;
    for (const row of effectRows) {
      if (!scale(row)) continue;
      if (row.effect.includes('UNIT_ADJUST_COMBAT')) {
        const amount = Math.max(0, n(row.args.Amount));
        const owned = Math.max(0, n(snapshot.counts?.[row.args.ResourceType]));
        const strengthGain = Math.min(RESOURCE_COMBAT_STRENGTH_CAP, (owned + 1) * amount)
          - Math.min(RESOURCE_COMBAT_STRENGTH_CAP, owned * amount);
        if (strengthGain <= 0) {
          if (amount > 0 && !cappedCombatEffects.some(item => item.resourceType === row.args.ResourceType)) {
            cappedCombatEffects.push({resourceType:row.args.ResourceType, owned,
              nextCopy:owned + 1, strengthCap:RESOURCE_COMBAT_STRENGTH_CAP});
          }
          continue;
        }
        if (!snapshot.unitsKnown) issues.add('military-data');
        const tags = row.requirements.flatMap(r => (r.args.Tag ?? '').split(',').map(t => t.trim()).filter(Boolean));
        const val = combatValue({units:snapshot.units, tags, strength:strengthGain * scale(row),
          sciencePerStrength:read(`resourceCombatScience${suffix}`), scienceWeight:1});
        if (snapshot.unitsKnown && val.affected === 0) {
          const key = tags.slice().sort().join(',');
          if (!missingCombatTargets.some(item => item.key === key)) {
            missingCombatTargets.push({key, tags});
          }
        }
        extra += globalScore({YIELD_SCIENCE:val.score});
      } else if (row.effect.includes('UNIT_ADJUST_HEAL')) {
        extra += globalScore({YIELD_SCIENCE:n(row.args.Amount) * n(read('resourceHealingScience')) * scale(row)});
      } else if (row.effect.endsWith('PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE')) {
        const record = effectRecord(row, null, issues);
        for (const [type, value] of Object.entries(record)) add(globalRecord, type, value);
      } else {
        for (const city of recipients) {
          const record = effectRecord(row, city, issues), combined = cityRecords.get(city.key);
          for (const [type, value] of Object.entries(record)) add(combined, type, value);
          actualHappiness.set(city.key,n(actualHappiness.get(city.key)) + n(record.YIELD_HAPPINESS) / scale(row));
        }
      }
    }
    return extra + globalScore(globalRecord) + recipients.reduce((sum, city) => {
      const record = cityRecords.get(city.key), actual = n(actualHappiness.get(city.key));
      if (!actual) return sum + cityScore(city,record);
      // Evaluation coefficients scale the value, not the physical happiness
      // change: a 50% setting must not invent a different deficit threshold.
      return sum + cityScore(city,{...record,YIELD_HAPPINESS:0})
        + cityScore(city,{YIELD_HAPPINESS:actual}) * n(record.YIELD_HAPPINESS) / actual;
    }, 0);
  }

  function eligible(def, city, origin) {
    if (!city.assignable) return false;
    if (def.ResourceClassType === 'RESOURCECLASS_CITY' && city.isTown) return false;
    if (def.ResourceClassType === 'RESOURCECLASS_FACTORY' && !city.hasFactory) return false;
    if (origin && city.key !== origin.key && !(city.connected && origin.connected)) return false;
    return true;
  }

  function placementScore(def, city, issues) {
    const list = forType(def.ResourceType);
    return effectsScore(list.filter(row => !globalEffect(row)), [city], issues)
      + effectsScore(list.filter(globalEffect), cities, issues);
  }

  return {
    evaluate(def, originKey) {
      const type = def.ResourceType, key = `${type}:${originKey ?? ''}`;
      if (cache.has(key)) return cache.get(key);
      const issues = new Set(), list = forType(type), origin = cities.find(c => c.key === originKey);
      const basic = {score:0, unassigned:0, uplift:0, empire:0, special:0, destination:null, issues:[], cappedCombatEffects:[], missingCombatTargets:[]};
      let result = {...basic};
      if (excluded.has(type)) return {...result, resourceType:type, reason:'excluded-resource'};
      if (!list.length && type !== 'RESOURCE_CAMELS') issues.add('unknown-resource');
      const resourceClass = def.ResourceClassType;
      const isEmpire = resourceClass === 'RESOURCECLASS_EMPIRE' || resourceClass === 'RESOURCECLASS_TREASURE';
      if (resourceClass === 'RESOURCECLASS_FACTORY' && !cities.some(c => c.hasFactory)) {
        result = {...basic, score:unassigned, unassigned, reason:'no-factory'};
      } else if (isEmpire || resourceClass === 'RESOURCECLASS_FACTORY') {
        const empire = effectsScore(list, cities, issues, basic.cappedCombatEffects, basic.missingCombatTargets);
        // Treasure fleet rewards are suspended by user request (2026-09-28).
        // The resource's normal empire effects continue to be valued.
        result = {...basic, score:empire, empire, reason:'empire'};
      } else if (n(snapshot.unassignedCounts?.[type]) > 0) {
        result = {...basic, score:unassigned, unassigned, reason:'unassigned-copy'};
      } else if (type === 'RESOURCE_CAMELS') {
        const candidateCities = cities.filter(c => eligible(def,c,origin)).map(city => ({cityID:city.key,
          unassignedResources:Object.entries(snapshot.unassignedCounts ?? {}).map(([otherType,count]) => {
            const other = snapshot.definitions?.[otherType];
            if (!other || otherType === type) return {count:0};
            return {resourceType:otherType, count, eligible:(snapshot.unassignedOrigins?.[otherType] ?? [null]).some(origin => eligible(other,city,origin)),
              unassignedScore:unassigned, placementScore:placementScore(other,city,issues)};
          })}));
        const value = camelValue({unassignedScore:unassigned,cities:candidateCities,slots:n(def.BonusResourceSlots) || 2});
        result = {...basic,...value,unassigned,special:value.score-unassigned,reason:'camel'};
        result.score = unassigned + (result.score-unassigned) * specialScale(type,'slots');
        result.special = result.score-unassigned;
      } else if (type === 'RESOURCE_INCENSE' && age === 'exploration') {
        const activeShare = (parseRatio(read('resourceIncenseActive'),2) ?? [1/3,2/3])[0];
        // Incense uses the empire-wide city average, independent of current slot availability.
        const targetCities = cities.filter(c => !c.isTown);
        const unitRow = list.find(row => row.args.UnitTag === 'UNIT_CLASS_RELIGIOUS');
        const buildingRow = list.find(row => row.args.ConstructibleType === 'BUILDING_TEMPLE');
        // One active-time budget covers both targets. They are alternatives, not
        // two simultaneous +100% bonuses. Preserve their production-plan balance.
        const total = shares.buildings + shares.units;
        const rate = total ? (shares.units * (unitRow ? scale(unitRow) : 0) + shares.buildings * (buildingRow ? scale(buildingRow) : 0)) / total : 0;
        const score = incenseValue({unassignedScore:unassigned,activeShare,
          cityProductionScores:targetCities.map(c => cityScore(c,{YIELD_PRODUCTION:Math.max(0,n(c.yields.YIELD_PRODUCTION))*rate}))});
        result = {...basic,score,unassigned:unassigned*(1-activeShare),special:score-unassigned*(1-activeShare),reason:'incense'};
      } else {
        if (!list.length) issues.add('unknown-resource');
        result = {...basic,...evaluatePlacement({unassignedScore:unassigned,
          placementRate:n(read('resourcePlacementPercent'))/100,
          placements:cities.filter(c => eligible(def,c,origin)).map(c => ({cityID:c.key,score:placementScore(def,c,issues)}))})};
      }
      result.issues = [...issues];
      result.resourceType = type;
      cache.set(key,result);
      return result;
    },
  };
}
