// Temporary panel state; deliberately never written to saved settings.
export function createBuildingEvaluationMode() {
  let activeCity = null;
  let excluded = false;
  const key = id => id == null ? null : typeof id === "object"
    ? [id.owner, id.id, id.type].join(":") : String(id);
  return {
    visit(cityID) {
      const next = key(cityID);
      if (next !== null && next !== activeCity) {
        activeCity = next;
        excluded = false;
      }
    },
    isExcluded(cityID) { return key(cityID) === activeCity && activeCity !== null && excluded; },
    toggle(cityID) {
      this.visit(cityID);
      if (activeCity !== null) excluded = !excluded;
      return this.isExcluded(cityID);
    },
  };
}
export const BuildingEvaluationMode = createBuildingEvaluationMode();
