import { BUILDING_SORT_MODE, WeightedYieldSettings } from "./settings.js";
import { t } from "./i18n.js";

const controls = new WeakMap();
const STYLE_ID = "wys-building-sort-style";
const MODES = [
  [BUILDING_SORT_MODE.EFFICIENCY, "sortEfficiency", "sortEfficiencyHint"],
  [BUILDING_SORT_MODE.WEIGHTED, "sortWeighted", "sortWeightedHint"],
  [BUILDING_SORT_MODE.DEFAULT, "sortDefault", "sortDefaultHint"],
];

function installStyles(doc) {
  if (!doc.head || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    [data-wys-building-sort-header] { min-width: 0; }
    [data-wys-building-sort-title] {
      min-width: 0; flex: 1 1 auto; justify-content: flex-start; padding-left: 0.75rem;
    }
    [data-wys-building-sort] {
      display: flex; flex-direction: row; align-items: center; flex: 0 0 auto;
      position: relative; margin-left: 0.5rem; margin-right: 0.25rem;
    }
    [data-wys-building-sort-mode] {
      display: flex; align-items: center; justify-content: center;
      flex: 0 0 auto; min-height: 1.6rem; min-width: 2.5rem;
      padding: 0.1rem 0.45rem; margin-left: 0.15rem;
      font-size: 0.78rem; line-height: 1.15; white-space: nowrap;
      color: #c2c4cc; background-color: rgba(12, 17, 25, 0.65);
      border: 0.0555556rem solid #62646b; border-radius: 0.15rem;
      pointer-events: auto;
    }
    [data-wys-building-sort-mode]:hover,
    [data-wys-building-sort-mode]:focus { border-color: #e5d2ac; color: #e5d2ac; }
    [data-wys-building-sort-mode][aria-pressed="true"] {
      color: #f5d67e; background-color: rgba(120, 93, 37, 0.5); border-color: #debf70;
    }
  `;
  doc.head.appendChild(style);
}

export function ensureBuildingSortControls(screen, onChange, doc = globalThis.document) {
  const section = screen?.productionCategorySlots?.buildings;
  const header = section?.header;
  const arrow = section?.arrowIcon;
  if (!doc?.createElement || !header || !arrow || arrow.parentElement !== header) return;
  let state = controls.get(screen);
  if (!state || state.group.parentElement !== header) {
    installStyles(doc);
    const group = doc.createElement("div");
    group.setAttribute("data-wys-building-sort", "");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", t("sortBuildings"));
    state = { group, buttons: [], onChange };
    const title = header.querySelector("[data-l10n-id]")?.parentElement;
    if (title?.parentElement === header) title.setAttribute("data-wys-building-sort-title", "");
    header.setAttribute("data-wys-building-sort-header", "");
    for (const [mode, label, hint] of MODES) {
      const button = doc.createElement("fxs-activatable");
      button.className = "font-body cursor-pointer";
      button.setAttribute("tabindex", "-1");
      button.setAttribute("data-wys-building-sort-mode", mode);
      button.setAttribute("aria-label", t(hint));
      button.setAttribute("data-tooltip-content", t(hint));
      button.textContent = t(label);
      button.addEventListener("action-activate", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (WeightedYieldSettings.get("buildingSortMode") === mode) return;
        WeightedYieldSettings.set("buildingSortMode", mode);
        updateSelection(state);
        state.onChange(mode);
      });
      group.appendChild(button);
      state.buttons.push(button);
    }
    // The parent is also activatable (collapse/expand). Do not let the
    // switch's pointer actions activate that header; navigation still bubbles.
    group.addEventListener("click", (event) => event.stopPropagation());
    group.addEventListener("engine-input", (event) => {
      if (["mousebutton-left", "accept", "touch-tap", "touch-touch", "keyboard-enter"]
        .includes(event.detail?.name)) event.stopPropagation();
    });
    header.insertBefore(group, arrow);
    controls.set(screen, state);
  }
  state.onChange = onChange;
  updateSelection(state);
}

function updateSelection(state) {
  const selected = WeightedYieldSettings.get("buildingSortMode");
  for (const button of state.buttons) {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-wys-building-sort-mode") === selected));
  }
}
