import "/core/ui/components/fxs-checkbox.js";
import "/core/ui/components/fxs-dropdown.js";
import { BuildingEvaluationMode } from "./building-evaluation-mode.js";
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
    [data-wys-building-sort-header] { min-width: 0; z-index: 2; }
    [data-wys-building-sort-title] {
      min-width: 0; flex: 1 1 auto; justify-content: flex-start; padding-left: 0.75rem;
    }
    [data-wys-building-sort] {
      display: flex; flex-direction: row; align-items: center; flex: 0 0 auto;
      position: relative; margin-left: 0.5rem; margin-right: 0.25rem;
      font-size: 0.78rem; line-height: 1.15;
    }
    [data-wys-rural-control] {
      display: flex; flex-direction: row; align-items: center;
      flex: 0 0 auto; margin-right: 1.25rem;
    }
    [data-wys-building-sort] [data-wys-exclude-rural] {
      flex: 0 0 auto; width: 1.3rem; height: 1.3rem;
    }
    [data-wys-rural-label] {
      display: flex; align-items: center; margin-left: 0.25rem;
      min-height: 1.7rem; white-space: nowrap; color: #c2c4cc;
    }
    [data-wys-rural-label]:hover { color: #e5d2ac; }
    [data-wys-building-sort] [data-wys-sort-dropdown] {
      flex: 0 0 auto; width: 7rem; min-width: 0; font-size: 0.78rem;
    }
    [data-wys-sort-dropdown] .dropdown__container {
      padding-left: 0.4rem; padding-right: 0.2rem; min-height: 1.7rem;
    }
    [data-wys-sort-dropdown] .dropdown__label { white-space: nowrap; }
    [data-wys-sort-dropdown] .dropdown__open-arrow {
      width: 1.2rem; height: 1.6rem; min-width: 1.2rem; min-height: 1.6rem;
    }
    [data-wys-sort-dropdown] .dropdown-item-container {
      min-height: 1.7rem; font-size: 0.78rem; white-space: nowrap;
    }
  `;
  doc.head.appendChild(style);
}

export function ensureBuildingSortControls(screen, onChange, doc = globalThis.document, onEvaluationChange = () => {}) {
  const section = screen?.productionCategorySlots?.buildings;
  const header = section?.header;
  const arrow = section?.arrowIcon;
  if (!doc?.createElement || !header || !arrow || arrow.parentElement !== header) return;
  let state = controls.get(screen);
  if (!state || state.group.parentElement !== header) {
    installStyles(doc);
    const group = doc.createElement("div");
    group.setAttribute("data-wys-building-sort", "");
    state = { group, onChange, onEvaluationChange, screen, syncing: false };
    const title = header.querySelector("[data-l10n-id]")?.parentElement;
    if (title?.parentElement === header) title.setAttribute("data-wys-building-sort-title", "");
    header.setAttribute("data-wys-building-sort-header", "");

    const ruralControl = doc.createElement("div");
    ruralControl.setAttribute("data-wys-rural-control", "");
    ruralControl.setAttribute("data-tooltip-content", t("excludeRuralImpactsHint"));
    const checkbox = doc.createElement("fxs-checkbox");
    checkbox.setAttribute("data-wys-exclude-rural", "");
    checkbox.setAttribute("role", "checkbox");
    checkbox.setAttribute("aria-label", t("excludeRuralImpacts"));
    checkbox.setAttribute("data-tooltip-content", t("excludeRuralImpactsHint"));
    checkbox.addEventListener("component-value-changed", event => {
      event.stopPropagation();
      // Native selected-attribute updates also emit forced change events.
      // Those synchronize the display and must not toggle/re-score the city.
      if (state.syncing || event.detail?.forced || typeof event.detail?.value !== "boolean") return;
      if (BuildingEvaluationMode.isExcluded(state.screen.city?.id) === event.detail.value) return;
      BuildingEvaluationMode.toggle(state.screen.city?.id);
      updateSelection(state);
      state.onEvaluationChange();
    });
    const label = doc.createElement("fxs-activatable");
    label.className = "font-body cursor-pointer";
    label.setAttribute("data-wys-rural-label", "");
    // The checkbox is the navigation target; the text is also clickable.
    label.setAttribute("data-disable-focus", "true");
    label.textContent = t("excludeRuralImpacts");
    label.addEventListener("action-activate", event => {
      event.stopPropagation();
      checkbox.component?.toggle();
    });
    ruralControl.appendChild(checkbox);
    ruralControl.appendChild(label);
    group.appendChild(ruralControl);
    state.checkbox = checkbox;

    const dropdown = doc.createElement("fxs-dropdown");
    dropdown.setAttribute("data-wys-sort-dropdown", "");
    dropdown.setAttribute("aria-label", t("sortBuildings"));
    dropdown.setAttribute("dropdown-items", JSON.stringify(MODES.map(([id, label, hint]) => ({
      id, label: t(label), tooltip: t(hint),
    }))));
    dropdown.addEventListener("dropdown-selection-change", event => {
      event.stopPropagation();
      if (state.syncing) return;
      const index = event.detail?.selectedIndex;
      if (!Number.isInteger(index) || !MODES[index]) return;
      const mode = MODES[index][0];
      if (WeightedYieldSettings.get("buildingSortMode") === mode) return;
      WeightedYieldSettings.set("buildingSortMode", mode);
      updateSelection(state);
      state.onChange(mode);
    });
    group.appendChild(dropdown);
    state.dropdown = dropdown;

    // Do not activate the accordion underneath either control. Let native
    // clicks reach the document so the dropdown can close on outside clicks.
    group.addEventListener("action-activate", event => event.stopPropagation());
    group.addEventListener("engine-input", event => {
      if (["mousebutton-left", "accept", "touch-tap", "touch-touch", "keyboard-enter"]
        .includes(event.detail?.name)) event.stopPropagation();
    });
    header.insertBefore(group, arrow);
    controls.set(screen, state);
  }
  state.onChange = onChange;
  state.onEvaluationChange = onEvaluationChange;
  updateSelection(state);
}

function updateSelection(state) {
  state.syncing = true;
  try {
    const excluded = String(BuildingEvaluationMode.isExcluded(state.screen.city?.id));
    if (state.checkbox.getAttribute("selected") !== excluded) state.checkbox.setAttribute("selected", excluded);
    state.checkbox.setAttribute("aria-checked", excluded);
    const selected = WeightedYieldSettings.get("buildingSortMode");
    const index = Math.max(0, MODES.findIndex(([mode]) => mode === selected));
    if (state.dropdown.getAttribute("selected-item-index") !== String(index)) {
      state.dropdown.setAttribute("selected-item-index", String(index));
    }
    state.dropdown.setAttribute("data-tooltip-content", t(MODES[index][2]));
  } finally {
    state.syncing = false;
  }
}
