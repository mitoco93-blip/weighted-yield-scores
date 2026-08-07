const MOD_ID = "wys-weighted-yield-scores";
const SHARED_STORAGE_KEY = "modSettings";

export const FOOD_MODE = Object.freeze({
  DYNAMIC: 0,
  FIXED: 1,
});

export const DEFAULT_SETTINGS = Object.freeze({
  foodMode: FOOD_MODE.DYNAMIC,
  foodWeight: 0.2,
  productionWeight: 1,
  goldWeight: 2 / 7,
  scienceWeight: 0.5,
  cultureWeight: 0.5,
  happinessWeight: 0.2,
  influenceWeight: 2,
});

const WEIGHT_SETTING_BY_YIELD = Object.freeze({
  YIELD_FOOD: "foodWeight",
  YIELD_PRODUCTION: "productionWeight",
  YIELD_GOLD: "goldWeight",
  YIELD_SCIENCE: "scienceWeight",
  YIELD_CULTURE: "cultureWeight",
  YIELD_HAPPINESS: "happinessWeight",
  YIELD_DIPLOMACY: "influenceWeight",
});

const finiteOr = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function normalizeSetting(optionID, value) {
  const fallback = DEFAULT_SETTINGS[optionID];
  if (optionID === "foodMode") {
    return Number(value) === FOOD_MODE.FIXED
      ? FOOD_MODE.FIXED
      : FOOD_MODE.DYNAMIC;
  }
  return Math.min(3, Math.max(0, finiteOr(value, fallback)));
}

function parseStoredObject(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readSharedStorage() {
  try {
    const root = parseStoredObject(
      globalThis.localStorage?.getItem?.(SHARED_STORAGE_KEY),
    );
    const settings = root[MOD_ID];
    return settings && typeof settings === "object" ? settings : {};
  } catch {
    return {};
  }
}

function writeSharedStorage(data) {
  try {
    const storage = globalThis.localStorage;
    if (!storage?.setItem) return;
    const root = parseStoredObject(storage.getItem?.(SHARED_STORAGE_KEY));
    root[MOD_ID] = data;
    storage.setItem(SHARED_STORAGE_KEY, JSON.stringify(root));
  } catch {
    // Use defaults when the game's persistent storage is unavailable.
  }
}

export class WeightedYieldSettingsStore {
  data = {};

  load(optionID) {
    const saved = readSharedStorage()[optionID];
    return normalizeSetting(
      optionID,
      saved == null ? DEFAULT_SETTINGS[optionID] : saved,
    );
  }

  save(optionID) {
    const value = normalizeSetting(optionID, this.data[optionID]);
    const stored = readSharedStorage();
    stored[optionID] = value;
    writeSharedStorage(stored);
  }

  get(optionID) {
    if (!(optionID in this.data)) this.data[optionID] = this.load(optionID);
    return this.data[optionID];
  }

  set(optionID, value) {
    this.data[optionID] = normalizeSetting(optionID, value);
    this.save(optionID);
  }

  resetOption(optionID) {
    if (!(optionID in DEFAULT_SETTINGS)) return;
    this.set(optionID, DEFAULT_SETTINGS[optionID]);
  }

  reset() {
    for (const optionID of Object.keys(DEFAULT_SETTINGS)) {
      this.resetOption(optionID);
    }
  }

  get foodMode() {
    return this.get("foodMode");
  }

  set foodMode(value) {
    this.set("foodMode", value);
  }

  get useDynamicFood() {
    return this.foodMode === FOOD_MODE.DYNAMIC;
  }

  getWeight(yieldType) {
    const optionID = WEIGHT_SETTING_BY_YIELD[yieldType];
    return optionID ? this.get(optionID) : 0;
  }

  setWeight(yieldType, value) {
    const optionID = WEIGHT_SETTING_BY_YIELD[yieldType];
    if (optionID) this.set(optionID, value);
  }

  getWeights() {
    return Object.fromEntries(
      Object.entries(WEIGHT_SETTING_BY_YIELD).map(([yieldType, optionID]) => [
        yieldType,
        this.get(optionID),
      ]),
    );
  }
}

export const WeightedYieldSettings = new WeightedYieldSettingsStore();
