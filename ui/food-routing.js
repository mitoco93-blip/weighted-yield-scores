// Match the native city-details model: project towns send equal amounts to
// connected cities; projects producing units do not export food.
export function getFoodRecipientCities(town) {
  if (!town?.isTown || globalThis.GrowthTypes?.PROJECT == null ||
      town.Growth?.growthType !== globalThis.GrowthTypes.PROJECT) return null;
  const project = globalThis.GameInfo?.Projects?.lookup?.(town.Growth?.projectType);
  if (!project || Array.from(globalThis.GameInfo?.Project_Units ?? [])
      .some(row => row.ProjectType === project.ProjectType)) return null;
  const connections = town.getConnectedCities?.();
  if (!Array.isArray(connections)) return null;
  const unique = new Map();
  for (const id of connections) {
    const city = globalThis.Cities?.get?.(id);
    if (!city || city.isTown || (town.owner != null && city.owner != null && town.owner !== city.owner)) continue;
    const key = JSON.stringify(city.id);
    unique.set(key, city);
  }
  return [...unique.values()];
}

// Average values, never populations. The native model sends getSentFoodPerCity()
// to each recipient, so each city's share of an additional food point is 1/N.
export function combineRecipientFoodValues(recipients) {
  if (!recipients.length) return null;
  const share = 1 / recipients.length;
  return {
    mode: 'export',
    weight: recipients.reduce((sum, recipient) => sum + recipient.weight * share, 0),
    recipients: recipients.map(recipient => ({...recipient, share})),
    approximate: recipients.some(recipient => recipient.approximate),
  };
}
