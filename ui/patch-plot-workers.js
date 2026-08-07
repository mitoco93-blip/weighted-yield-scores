import PlotWorkersManager from "/base-standard/ui/plot-workers/plot-workers-manager.js";
import { WeightedYieldConfig } from "./config.js";
import { WeightedYieldRuntime } from "./runtime.js";

const prototype = Object.getPrototypeOf(PlotWorkersManager);
const PATCH_FLAG = "__wysWeightedYieldScoresPatched";

const diagnostic = (message, error = undefined) => {
  if (!WeightedYieldConfig.diagnostics) return;
  if (error) console.warn(`[Weighted Yield Scores] ${message}`, error);
  else console.warn(`[Weighted Yield Scores] ${message}`);
};

function refreshForManager(manager) {
  try {
    const cityID = manager?.cityID ?? manager?._cityID;
    if (cityID != null) WeightedYieldRuntime.refreshSpecialists(cityID);
  } catch (error) {
    diagnostic("PlotWorkersManager refresh hook failed.", error);
  }
}

if (!prototype[PATCH_FLAG]) {
  prototype[PATCH_FLAG] = true;

  const originalUpdate = prototype.update;
  if (typeof originalUpdate === "function") {
    prototype.update = function (...args) {
      const result = originalUpdate.apply(this, args);
      refreshForManager(this);
      return result;
    };
  } else {
    diagnostic("PlotWorkersManager.update was not found.");
  }

  const originalInitialize = prototype.initializeWorkersData;
  if (typeof originalInitialize === "function") {
    prototype.initializeWorkersData = function (...args) {
      const result = originalInitialize.apply(this, args);
      refreshForManager(this);
      return result;
    };
  }

  const originalReset = prototype.reset;
  if (typeof originalReset === "function") {
    prototype.reset = function (...args) {
      // This reset also runs during the transition into improvement mode.
      // Preserve the improvement candidates that PlacePopulation just cached.
      WeightedYieldRuntime.clearSpecialists();
      return originalReset.apply(this, args);
    };
  }
}
