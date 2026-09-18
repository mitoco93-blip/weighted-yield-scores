import { BUILDING_SORT_MODE } from "./settings.js";

// This receives a copy of the game's array. Original indices always refer to
// the order supplied by the game (or City Hall), before WYS sorts anything.
export function sortBuildingItems(buildings, mode) {
  const entries = buildings.map((item, index) => ({
    item,
    index: Number.isFinite(item.wysOriginalIndex) ? item.wysOriginalIndex : index,
  }));
  const valueOf = (item) => {
    const value = mode === BUILDING_SORT_MODE.WEIGHTED
      ? item.wysBuildingEvaluation?.score
      : item.wysBuildingPriority;
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };
  entries.sort((a, b) => {
    if (mode !== BUILDING_SORT_MODE.DEFAULT) {
      const av = valueOf(a.item);
      const bv = valueOf(b.item);
      if ((av !== null) !== (bv !== null)) return av !== null ? -1 : 1;
      if (av !== null && av !== bv) return bv - av;
    }
    return a.index - b.index;
  });
  return entries.map(({ item }) => item);
}
