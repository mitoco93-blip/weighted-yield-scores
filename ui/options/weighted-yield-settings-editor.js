import Panel from "/core/ui/panel-support.js";
import { MustGetElement } from "/core/ui/utilities/utilities-dom.js";
import { DropdownSelectionChangeEventName } from "/core/ui/components/fxs-dropdown.js";
import { InputEngineEventName } from "/core/ui/input/input-support.js";
import {
  DEFAULT_SETTINGS,
  FOOD_MODE,
  WeightedYieldSettings,
} from "../settings.js";

const FOOD_MODE_ITEMS = [
  { label: "LOC_OPTIONS_WYS_FOOD_DYNAMIC" },
  { label: "LOC_OPTIONS_WYS_FOOD_FIXED" },
];

const WEIGHT_FIELDS = [
  { optionID: "foodWeight", label: "LOC_OPTIONS_WYS_WEIGHT_FOOD" },
  { optionID: "productionWeight", label: "LOC_OPTIONS_WYS_WEIGHT_PRODUCTION" },
  { optionID: "goldWeight", label: "LOC_OPTIONS_WYS_WEIGHT_GOLD" },
  { optionID: "scienceWeight", label: "LOC_OPTIONS_WYS_WEIGHT_SCIENCE" },
  { optionID: "cultureWeight", label: "LOC_OPTIONS_WYS_WEIGHT_CULTURE" },
  { optionID: "happinessWeight", label: "LOC_OPTIONS_WYS_WEIGHT_HAPPINESS" },
  { optionID: "influenceWeight", label: "LOC_OPTIONS_WYS_WEIGHT_INFLUENCE" },
];

export function parseWeightInput(value) {
  const text = String(value ?? "").trim();
  if (text === "") return null;
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 && number <= 3
    ? number
    : null;
}

export function formatWeightInput(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return String(Number(number.toFixed(4)));
}

function installStyle() {
  if (document.getElementById("wys-settings-editor-style")) return;
  const style = document.createElement("style");
  style.id = "wys-settings-editor-style";
  style.textContent = `
    wys-settings-editor .wys-settings-frame {
      width: 56rem;
      max-height: 56rem;
    }
    wys-settings-editor .wys-settings-content {
      width: 48rem;
      padding-top: 3rem;
      padding-bottom: 1rem;
    }
    wys-settings-editor .wys-setting-row {
      min-height: 3.25rem;
    }
    wys-settings-editor.wys-locale-ja .wys-setting-row--food,
    wys-settings-editor.wys-locale-ja .wys-setting-row--weight {
      justify-content: flex-start;
      padding-left: 7rem;
    }
    wys-settings-editor.wys-locale-ja .wys-setting-label {
      width: 11rem;
      text-align: right;
    }
    wys-settings-editor.wys-locale-ja .wys-food-mode,
    wys-settings-editor.wys-locale-ja .wys-weight-controls {
      margin-left: 2rem;
    }
    wys-settings-editor.wys-locale-ja .wys-food-mode {
      width: 12rem;
    }
    wys-settings-editor .wys-setting-row--disabled {
      opacity: 0.45;
    }
    wys-settings-editor .wys-weight-input {
      width: 9rem;
      height: 2.5rem;
      flex: none;
      box-sizing: border-box;
      border: 0.1rem solid rgba(0, 0, 0, 0.95);
      border-radius: 0;
      outline: none;
      background-color: rgba(0, 0, 0, 0.72);
      box-shadow: none;
      -webkit-appearance: none;
      appearance: none;
      color: #f4eee1;
      padding: 0 0.75rem;
      line-height: 2.3rem;
      text-align: left;
      caret-color: #f4eee1;
    }
    wys-settings-editor .wys-weight-input:focus {
      border-color: #d6b66f;
      outline: none;
      box-shadow: none;
    }
    wys-settings-editor .wys-weight-input:disabled {
      cursor: default;
    }
    wys-settings-editor .wys-weight-input--invalid {
      color: #ff8080;
    }
    wys-settings-editor .wys-reset-one {
      min-width: 7rem;
    }
    wys-settings-editor .wys-reset-all {
      min-width: 22rem;
    }
  `;
  document.head.appendChild(style);
}

class WeightedYieldSettingsEditor extends Panel {
  constructor(root) {
    super(root);
    this.inputListeners = new Map();
    this.onCloseListener = this.closeEditor.bind(this);
    this.onResetAllListener = this.resetAll.bind(this);
    this.onFoodModeListener = this.onFoodModeChanged.bind(this);
    this.onEngineInputListener = this.onEngineInput.bind(this);
  }

  onInitialize() {
    super.onInitialize();
    installStyle();
    this.render();
    this.Root.setAttribute("data-audio-group-ref", "options");

    this.closeButton = MustGetElement(".wys-settings-close", this.Root);
    this.resetAllButton = MustGetElement(".wys-reset-all", this.Root);
    this.foodModeDropdown = MustGetElement(".wys-food-mode", this.Root);
    this.foodModeDropdown.setAttribute(
      "dropdown-items",
      JSON.stringify(FOOD_MODE_ITEMS),
    );
    this.refreshAllControls();
  }

  onAttach() {
    super.onAttach();
    this.closeButton.addEventListener("action-activate", this.onCloseListener);
    this.resetAllButton.addEventListener(
      "action-activate",
      this.onResetAllListener,
    );
    this.foodModeDropdown.addEventListener(
      DropdownSelectionChangeEventName,
      this.onFoodModeListener,
    );
    this.Root.addEventListener(InputEngineEventName, this.onEngineInputListener);

    for (const { optionID } of WEIGHT_FIELDS) {
      const input = this.getWeightInput(optionID);
      const resetButton = this.getResetButton(optionID);
      const changed = () => this.onWeightInput(optionID);
      const blurred = () => this.onWeightInputBlurred(optionID);
      const keydown = (event) => this.onWeightInputKeyDown(optionID, event);
      const reset = () => this.resetOne(optionID);
      input.addEventListener("input", changed);
      input.addEventListener("blur", blurred);
      input.addEventListener("keydown", keydown);
      resetButton.addEventListener("action-activate", reset);
      this.inputListeners.set(optionID, { changed, blurred, keydown, reset });
    }

    this.refreshAllControls();
  }

  onDetach() {
    this.closeButton.removeEventListener("action-activate", this.onCloseListener);
    this.resetAllButton.removeEventListener(
      "action-activate",
      this.onResetAllListener,
    );
    this.foodModeDropdown.removeEventListener(
      DropdownSelectionChangeEventName,
      this.onFoodModeListener,
    );
    this.Root.removeEventListener(InputEngineEventName, this.onEngineInputListener);

    for (const { optionID } of WEIGHT_FIELDS) {
      const listeners = this.inputListeners.get(optionID);
      if (!listeners) continue;
      const input = this.getWeightInput(optionID);
      input.removeEventListener("input", listeners.changed);
      input.removeEventListener("blur", listeners.blurred);
      input.removeEventListener("keydown", listeners.keydown);
      this.getResetButton(optionID).removeEventListener(
        "action-activate",
        listeners.reset,
      );
    }
    this.inputListeners.clear();
    super.onDetach();
  }

  render() {
    const japanese = Locale.compose("LOC_OPTIONS_WYS_FOOD_MODE") === "食料の評価方式";
    this.Root.classList.toggle("wys-locale-ja", japanese);
    this.Root.classList.add(
      "absolute",
      "flex",
      "justify-center",
      "fullscreen",
      "max-w-screen",
      "max-h-screen",
      "pointer-events-auto",
    );
    const weightRows = WEIGHT_FIELDS.map(
      ({ optionID, label }) => `
        <div class="wys-setting-row wys-setting-row--weight flex items-center justify-between mb-2" data-wys-row="${optionID}">
          <div class="wys-setting-label font-body text-base" data-l10n-id="${label}"></div>
          <div class="wys-weight-controls flex flex-row items-center">
            <input class="wys-weight-input font-body text-base" data-wys-input="${optionID}" type="text" inputmode="decimal" maxlength="8" autocomplete="off" spellcheck="false">
            <fxs-button class="wys-reset-one ml-2" data-wys-reset="${optionID}" caption="LOC_OPTIONS_WYS_RESET_ONE"></fxs-button>
          </div>
        </div>`,
    ).join("");

    this.Root.innerHTML = `
      <div class="absolute img-lsgb-egypt-720 fullscreen"></div>
      <fxs-frame class="wys-settings-frame flex-initial" content-as="fxs-vslot" content-class="flex-auto">
        <fxs-vslot class="flex-auto" focus-rule="last">
          <fxs-header class="self-center mb-4 font-title text-xl text-secondary" title="LOC_OPTIONS_WYS_SETTINGS_TITLE" filigree-style="none"></fxs-header>
          <fxs-scrollable class="flex-auto" attached-scrollbar="true" allow-mouse-panning="true">
            <div class="wys-settings-content flex flex-col px-6">
              <div class="font-body text-sm mb-4" data-l10n-id="LOC_OPTIONS_WYS_SETTINGS_DESCRIPTION"></div>
              <div class="wys-setting-row wys-setting-row--food flex items-center justify-between mb-2">
                <div class="wys-setting-label font-body text-base" data-l10n-id="LOC_OPTIONS_WYS_FOOD_MODE"></div>
                <fxs-dropdown class="wys-food-mode w-64"></fxs-dropdown>
              </div>
              ${weightRows}
              <div class="font-body text-sm mt-2 mb-4" data-l10n-id="LOC_OPTIONS_WYS_INPUT_RANGE"></div>
              <div class="flex justify-center mt-4 mb-2">
                <fxs-button class="wys-reset-all" caption="LOC_OPTIONS_WYS_RESET_ALL"></fxs-button>
              </div>
            </div>
          </fxs-scrollable>
        </fxs-vslot>
        <div class="flex justify-center mt-6">
          <fxs-hero-button class="wys-settings-close" caption="LOC_OPTIONS_WYS_CLOSE_SETTINGS"></fxs-hero-button>
        </div>
      </fxs-frame>
    `;
  }

  getWeightInput(optionID) {
    return MustGetElement(`[data-wys-input="${optionID}"]`, this.Root);
  }

  getResetButton(optionID) {
    return MustGetElement(`[data-wys-reset="${optionID}"]`, this.Root);
  }

  refreshAllControls() {
    this.foodModeDropdown.setAttribute(
      "selected-item-index",
      String(WeightedYieldSettings.foodMode),
    );
    for (const { optionID } of WEIGHT_FIELDS) this.refreshWeightInput(optionID);
    this.refreshFoodAvailability();
  }

  refreshWeightInput(optionID) {
    const input = this.getWeightInput(optionID);
    input.value = formatWeightInput(WeightedYieldSettings.get(optionID));
    input.classList.remove("wys-weight-input--invalid");
    input.removeAttribute("data-tooltip-content");
  }

  refreshFoodAvailability() {
    const dynamic = WeightedYieldSettings.useDynamicFood;
    const row = MustGetElement('[data-wys-row="foodWeight"]', this.Root);
    const input = this.getWeightInput("foodWeight");
    const resetButton = this.getResetButton("foodWeight");
    row.classList.toggle("wys-setting-row--disabled", dynamic);
    input.disabled = dynamic;
    input.setAttribute("aria-disabled", String(dynamic));
    resetButton.setAttribute("disabled", String(dynamic));
  }

  onFoodModeChanged(event) {
    WeightedYieldSettings.foodMode = event.detail.selectedIndex;
    this.refreshFoodAvailability();
  }

  onWeightInput(optionID) {
    const input = this.getWeightInput(optionID);
    const value = parseWeightInput(input.value);
    const valid = value != null;
    input.classList.toggle("wys-weight-input--invalid", !valid);
    if (!valid) {
      input.setAttribute(
        "data-tooltip-content",
        Locale.compose("LOC_OPTIONS_WYS_INPUT_ERROR"),
      );
      return;
    }
    input.removeAttribute("data-tooltip-content");
    WeightedYieldSettings.set(optionID, value);
  }

  onWeightInputBlurred(optionID) {
    const input = this.getWeightInput(optionID);
    const value = parseWeightInput(input.value);
    if (value == null) {
      this.refreshWeightInput(optionID);
      return;
    }
    WeightedYieldSettings.set(optionID, value);
    this.refreshWeightInput(optionID);
  }

  onWeightInputKeyDown(optionID, event) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      return;
    }
    if (event.key !== "Escape") return;
    this.refreshWeightInput(optionID);
    event.currentTarget.blur();
    event.preventDefault();
    event.stopPropagation();
  }

  resetOne(optionID) {
    WeightedYieldSettings.resetOption(optionID);
    this.refreshWeightInput(optionID);
  }

  resetAll() {
    WeightedYieldSettings.reset();
    this.refreshAllControls();
  }

  onEngineInput(event) {
    if (event.detail.status !== InputActionStatuses.FINISH) return;
    if (!event.isCancelInput()) return;
    this.closeEditor();
    event.preventDefault();
    event.stopPropagation();
  }

  closeEditor() {
    this.close();
  }
}

Controls.define("wys-settings-editor", {
  createInstance: WeightedYieldSettingsEditor,
  description: "Weighted Yield Scores settings editor",
});
