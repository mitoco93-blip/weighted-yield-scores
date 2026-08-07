import { getModLanguage } from "./i18n.js";

const FIXED_SHORT_NAMES = new Map([
  ["ポルタル・デ・メルカデレス", "ポルタル・デ・メル…"],
]);

const ENGLISH_TRUNCATION_LENGTH = 20;
const ENGLISH_VISIBLE_LENGTH = 16;

function localizedName(name, locale) {
  const composed = locale?.compose?.(name);
  return composed == null ? String(name ?? "") : String(composed);
}

export function applyFixedBuildingListName(
  item,
  locale = globalThis.Locale,
) {
  if (!item) return false;

  const originalName = item.wysOriginalName ?? item.name;
  const fullName = localizedName(originalName, locale);
  const fixedShortName = FIXED_SHORT_NAMES.get(fullName);
  const characters = Array.from(fullName);
  const shortName = fixedShortName ?? (
    getModLanguage(locale) === "en" &&
    characters.length >= ENGLISH_TRUNCATION_LENGTH
      ? `${characters.slice(0, ENGLISH_VISIBLE_LENGTH).join("")}…`
      : null
  );
  if (!shortName) return false;

  item.wysOriginalName = originalName;
  item.name = shortName;
  return true;
}
