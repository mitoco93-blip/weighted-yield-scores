import "/core/ui/options/screen-options.js";
import {
  CategoryType,
  Options,
  OptionType,
} from "/core/ui/options/model-options.js";
import { CategoryData } from "/core/ui/options/options-helpers.js";
import "./weighted-yield-settings-editor.js";

CategoryType.Mods = "mods";
CategoryData[CategoryType.Mods] ??= {
  title: "LOC_UI_CONTENT_MGR_SUBTITLE",
  description: "LOC_UI_CONTENT_MGR_SUBTITLE_DESCRIPTION",
};

if (!document.getElementById("wys-mod-options-style")) {
  const style = document.createElement("style");
  style.id = "wys-mod-options-style";
  style.textContent = `
    .option-frame .tab-bar__items fxs-tab-item {
      flex: 1 0 auto;
      min-width: 0rem;
      margin-left: 0.4444444444rem;
      margin-right: 0.4444444444rem;
    }
  `;
  document.head.appendChild(style);
}

Options.addInitCallback(() => {
  Options.addOption({
    category: CategoryType.Mods,
    group: "wys_weighted_yield_scores",
    type: OptionType.Editor,
    id: "wys-open-settings",
    editorTagName: "wys-settings-editor",
    label: "LOC_OPTIONS_WYS_SETTINGS_ENTRY",
    description: "LOC_OPTIONS_WYS_SETTINGS_ENTRY_DESCRIPTION",
    caption: "LOC_OPTIONS_WYS_OPEN_SETTINGS",
  });
});
