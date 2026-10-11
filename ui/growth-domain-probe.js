// Read-only investigation. A growth domain is NOT assumed to be a legal
// relocation list; compare it with EXPAND before using it for evaluation.
const snapshots = new Map();
const safe = fn => { try { return fn(); } catch (error) { return { error: String(error) }; } };

function memberNames(object) {
  const names = new Set();
  for (let depth = 0; object && depth < 4; depth++, object = Object.getPrototypeOf(object)) {
    for (const name of Object.getOwnPropertyNames(object)) {
      if (/growth|claim|expand|district|construct|place|valid|adjacent|range|radius|owner|reveal|terrain|resource|city|canStart/i.test(name)) names.add(name);
    }
  }
  return [...names].sort();
}

export function probeGrowthDomain(city, api, log, version) {
  if (!city) return;
  const key = JSON.stringify(city.id);
  const purchased = safe(() => city.getPurchasedPlots());
  const context = {
    turn: api.Game?.turn, location: city.location,
    pending: city.pendingPopulation,
    ready: city.Growth?.isReadyToPlacePopulation,
    expandReady: city.Growth?.isReadyToExpand,
    rural: city.ruralPopulation, urban: city.urbanPopulation, purchased,
  };
  const fingerprint = JSON.stringify(context);
  if (snapshots.get(key) === fingerprint) return;
  snapshots.set(key, fingerprint);
  const emit = (label, value) => log('Growth domain probe ' + JSON.stringify({ version, city: key, label, value }));
  const emitFields = (label, value) => {
    if (value == null || typeof value !== 'object') { emit(label, value ?? null); return; }
    for (const [field, item] of Object.entries(value)) {
      if (Array.isArray(item)) {
        emit(label + '-' + field + '-count', item.length);
        for (let i = 0; i < item.length; i += 8) emit(label + '-' + field + '-' + i, item.slice(i, i + 8));
      } else emit(label + '-' + field, item);
    }
  };
  emitFields('context', context);
  const player = safe(() => api.Players?.get?.(city.owner ?? city.id.owner));
  for (const [name, object] of Object.entries({
    GameplayMap: api.GameplayMap, MapCities: api.MapCities,
    CityCommands: api.Game?.CityCommands, CityOperations: api.Game?.CityOperations,
    Districts: city.Districts, PlayerCities: player?.Cities, PlayerAI: player?.AI,
  })) {
    const members = safe(() => memberNames(object));
    if (Array.isArray(members)) {
      for (let i = 0; i < members.length; i += 8) emit('members-' + name + '-' + i, members.slice(i, i + 8));
    } else emit('members-' + name, members);
  }
  // Verified signature: shipped worker-yields-layer.js, realizeGrowthPlots().
  const domain = safe(() => city.Growth.getGrowthDomain(true));
  emitFields('domain', { plots: domain });
  const domainSet = new Set(Array.isArray(domain) ? domain : []);
  const purchasedSet = new Set(Array.isArray(purchased) ? purchased : []);
  const map = api.GameplayMap;
  const frontier = new Set();
  const directions = ['NORTHEAST', 'EAST', 'SOUTHEAST', 'SOUTHWEST', 'WEST', 'NORTHWEST']
    .map(name => api.DirectionTypes?.['DIRECTION_' + name]).filter(value => value != null);
  for (const plot of purchasedSet) {
    const location = safe(() => map.getLocationFromIndex(plot));
    if (!location || location.error) continue;
    for (const direction of directions) {
      const adjacent = safe(() => map.getAdjacentPlotLocation(location, direction));
      if (!adjacent || adjacent.error || adjacent.x < 0 || adjacent.y < 0) continue;
      const index = safe(() => map.getIndexFromLocation(adjacent));
      if (Number.isInteger(index) && index >= 0 && !purchasedSet.has(index)) frontier.add(index);
    }
  }
  // Both calls are queries only. Do not send commands or create population.
  for (const mode of [false, true]) {
    emitFields('EXPAND-' + mode, safe(() => api.Game.CityCommands.canStart(city.id, api.CityCommandTypes.EXPAND, {}, mode)));
  }
  for (const plot of new Set([...domainSet, ...frontier])) {
    if (purchasedSet.has(plot)) continue;
    const location = safe(() => map.getLocationFromIndex(plot));
    if (!location || location.error) continue;
    const { x, y } = location;
    emit('plot', {
      plot, location, domain: domainSet.has(plot), frontier: frontier.has(plot),
      distance: safe(() => map.getPlotDistance(city.location.x, city.location.y, x, y)),
      owner: safe(() => map.getOwner(x, y)),
      owningCity: safe(() => map.getOwningCityFromXY(x, y)),
      revealed: safe(() => map.getRevealedState(api.GameContext.localPlayerID, x, y)),
      resource: safe(() => map.getResourceType(x, y)),
    });
    if (!domainSet.has(plot) && !frontier.has(plot)) continue;
    for (const mode of [false, true]) {
      emitFields('plot-' + plot + '-EXPAND-' + mode, safe(() => api.Game.CityCommands.canStart(city.id, api.CityCommandTypes.EXPAND, { X: x, Y: y }, mode)));
    }
  }
}
