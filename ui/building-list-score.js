import { getBuildingListScoreParts } from "./building-details.js";
import { t } from "./i18n.js";

const SCORE_SELECTOR = "[data-wys-building-list-score]";
const WEIGHTED_SELECTOR = '[data-wys-score-part="weighted"]';
const EFFICIENCY_SELECTOR = '[data-wys-score-part="efficiency"]';

function findBuildingNameElement(row) {
  if (!row?.querySelector) return null;
  return (
    row.querySelector(".font-title.text-accent-2.uppercase") ??
    row.querySelector(".font-title.uppercase") ??
    row.querySelector(".font-title")
  );
}

function applyWrapperStyle(element) {
  element.className = "wys-building-list-score font-body";
  element.style.display = "inline-flex";
  element.style.alignItems = "baseline";
  element.style.flexShrink = "0";
  element.style.whiteSpace = "nowrap";
  element.style.lineHeight = "1";
  element.style.marginLeft = "0.4rem";
  element.style.textTransform = "none";
}

function applyWeightedStyle(element) {
  element.style.fontSize = "0.8em";
  element.style.color = "rgba(205, 205, 200, 0.72)";
  element.style.fontWeight = "400";
}

function applySeparatorStyle(element) {
  element.style.fontSize = "0.8em";
  element.style.color = "rgba(205, 205, 200, 0.62)";
  element.style.fontWeight = "400";
}

function applyEfficiencyStyle(element) {
  element.style.fontSize = "0.8em";
  element.style.color = "rgb(222, 191, 112)";
  element.style.fontWeight = "700";
}

function createScoreElement(documentObject) {
  const wrapper = documentObject.createElement("span");
  wrapper.setAttribute("data-wys-building-list-score", "");
  applyWrapperStyle(wrapper);

  const weighted = documentObject.createElement("span");
  weighted.setAttribute("data-wys-score-part", "weighted");
  applyWeightedStyle(weighted);

  const separator = documentObject.createElement("span");
  separator.setAttribute("aria-hidden", "true");
  separator.textContent = "｜";
  applySeparatorStyle(separator);

  const efficiency = documentObject.createElement("span");
  efficiency.setAttribute("data-wys-score-part", "efficiency");
  applyEfficiencyStyle(efficiency);

  wrapper.append(weighted, separator, efficiency);
  return wrapper;
}

export function clearBuildingListScore(row) {
  row?.querySelector?.(SCORE_SELECTOR)?.remove?.();
}

export function renderBuildingListScore(
  row,
  evaluation,
  documentObject = globalThis.document,
) {
  if (!row || !evaluation || !documentObject?.createElement) {
    clearBuildingListScore(row);
    return false;
  }

  const nameElement = findBuildingNameElement(row);
  if (!nameElement?.parentElement) return false;

  const parts = getBuildingListScoreParts(evaluation);
  if (!parts) {
    clearBuildingListScore(row);
    return false;
  }

  let scoreElement = row.querySelector?.(SCORE_SELECTOR);
  if (!scoreElement) scoreElement = createScoreElement(documentObject);

  if (scoreElement.parentElement !== nameElement) {
    nameElement.append?.(scoreElement);
  }

  const weighted = scoreElement.querySelector?.(WEIGHTED_SELECTOR);
  const efficiency = scoreElement.querySelector?.(EFFICIENCY_SELECTOR);
  if (!weighted || !efficiency) return false;

  weighted.textContent = `W${parts.weightedValue}`;
  efficiency.textContent = `E${parts.efficiency}`;
  scoreElement.setAttribute(
    "aria-label",
    t("scoreAria", {
      weighted: parts.weightedValue,
      efficiency: parts.efficiency,
    }),
  );
  return true;
}
