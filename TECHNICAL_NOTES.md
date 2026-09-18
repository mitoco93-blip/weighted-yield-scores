# Weighted Yield Scores Technical Notes

[日本語](TECHNICAL_NOTES_JA.md) | [Back to README](README.md)

Weighted Yield Scores is a UI mod for Civilization VII that compares tile improvements, Specialist placements, and buildings using weighted values based on exchange rates configured by the player.

## Dynamic Food Valuation

Food valuation estimates up to three Population increases using assigned Population (Rural Population plus Specialists), current Food, the Food required for the next Population increase, the remaining evaluation period, and the yields of the best candidates. The evaluation period is at most 60 turns, or the remaining turns until the game ends if fewer than 60 remain. Urban Population is not included in assigned Population.

The ratio between the current Food requirement obtained from the game and the base growth curve is also applied to future Food requirements. Game speed and growth modifiers are therefore reflected through the actual Food requirement, without identifying settings by name.

The `foodValuation` section of `ui/config.js` contains these controls:

- `candidateCount`: Number of top candidates used to estimate the value of future citizens (default: 3).
- `horizonTurns`: Maximum evaluation period (default: 60 turns, capped at the remaining turns until the game ends).
- `maximumGrowths`: Number of Population increases to estimate (default: 3).
- `minimumWeight` / `maximumWeight`: Lower and upper bounds for the Production-equivalent value of 1 Food.

The reference point at which 1 Food is valued as 1 Production is approximately 315 Food required for the next Population increase. The actual value varies with the current growth cost, candidate citizen values, and evaluation period. When set to Fixed, the configured Food weight is always used.

## Dynamic Happiness Shortfall Adjustment

At Happiness levels of zero or above, 1 Happiness is valued as 0.2 Production. If a candidate causes settlement Happiness to become negative or recover from a negative value, a Happiness shortfall adjustment accounts for the change in non-Food settlement yields: 5% per point of Happiness, capped at 80%.

For example, if current Happiness is -3 and a candidate provides +5 Happiness, the evaluation adds the value of restoring settlement yields from a -15% penalty to no penalty, on top of the normal value of `5 × 0.2`. The remaining 2 points above zero receive no shortfall adjustment.

Government abilities tied to Happiness thresholds of 20 or 40 are not included.

## Resource Tile Valuation

For resource candidates, the evaluation adds the yields of one newly acquired, unassigned resource as a minimum value, in addition to the tile's own yields. This value comes from the game's `getUnassignedResourceYieldBonus`, so it reflects the Age and current rule modifiers.

Empire and Treasure resources without an unassigned bonus are excluded. Effects gained by assigning a resource to a slot are currently excluded because they vary substantially with the destination.

## Accuracy of Improvement Candidates

Specialist candidates use the current yields, post-placement yields, and maintenance that the game exposes for every candidate, so their values are accurate in the candidate list. Yield changes use the following formula, including additional Food and Happiness maintenance as negative values:

```text
(Post-placement yields - Current yields) + (Current maintenance - Post-placement maintenance)
```

Improvement candidates initially use estimates that combine the current terrain, feature, and resource yields with the static base yields of the automatically selected improvement. Dynamic modifiers from policies, civilization abilities, Warehouses, and conditional adjacency may not be fully available until the candidate is hovered over. The details shown after hovering directly evaluate the full candidate tile yields returned by the game.

## Building Evaluation

For each building, the mod examines all placement candidates supplied by the game and evaluates yield changes including adjacency bonuses, Warehouse effects, replacement of existing improvements or buildings, and maintenance.

When an Urban building replaces a Rural improvement, the evaluation subtracts the total yields of the Rural tile being removed and adds the value of assigning the displaced Population to the highest-value legal destination on the current map. When constructing a building, the unfinished building's own Specialist slots are not included as candidates.

When one improvement replaces another, such as a unique improvement replacing an existing improvement, the Population and underlying ordinary improvement remain on that tile, so no reassignment value is added. The loss of the old improvement's direct yields is taken from the game's placement delta.

When overbuilding Kabaka's Lake, adjacency yields arising from the lake state that are missing from the game's placement delta are obtained from `MapPlotYields` and additionally subtracted using the measured values.

When overbuilding an Urban building, the evaluation includes changes to the yields and maintenance of the building that is actually replaced.

If unowned Rural candidates cannot be obtained from the normal building screen, the mod reconstructs unowned, empty tiles adjacent to the settlement's territory and estimates their standard improvements using `District_FreeConstructibles`. These estimates include terrain yields, fixed yields from the standard improvement, and the minimum resource value. Future Warehouse, adjacency, and some conditional modifiers are not fully predicted.

The game's UI API does not return hypothetical yields for a Specialist slot that does not yet exist before a purchase. Purchase evaluations therefore also use only currently existing reassignment candidates, which can undervalue a purchase location when a newly created slot would be best. For construction, Population reassignment occurs before completion, so this limitation matches the actual sequence of play.

## Shared Building List Efficiency Index

Both the Production and Purchase tabs use this formula:

```text
Shared efficiency index
= round(Adjusted weighted value / Remaining Production cost × 10,000)
```

10,000 is a display multiplier that turns small fractions into readable integers without changing their relative order. Neither the Gold purchase price nor current yields per turn enter the formula, so the same evaluated value and Production cost produce the same E in both tabs. This is a shared comparison index, not actual Gold efficiency.

## Building List Sorting

- **E order**: Sorts by the shared efficiency index, highest first.
- **W order**: Sorts by weighted value, highest first.
- **Default**: Disables this mod's sorting and restores the order received from the game or another mod. W/E labels and yield corrections remain active.

The initial setting is E order. Your selection is saved. Items with equal E or W retain their original order. In E order and W order, items whose evaluation values are unavailable appear after evaluated items.

## Settings

Open the dedicated settings screen under **Options → Add-ons → Weighted Yield Scores settings**.

- Food valuation method: Switches between Dynamic and Fixed. The fixed Food weight field is disabled in Dynamic mode.
- Yield weights: Accept values from 0 to 3.
- Reset to default on each row: Resets only that yield to its default value.
- Reset all settings for this mod: Resets the Food mode and all yield weights.

Settings are saved and shared across all evaluations. If you change them during a game, close and reopen the evaluation screen.

## Display Settings

Spacing between yield icons and values adjusts to the number of yield entries, and entries wrap when they do not fit the available width. Ageless is shown using the game's official icon, with its tooltip following the game's language setting.

The `display` section of `ui/config.js` provides these controls:

- `showMapScores`: Candidate scores on the map.
- `showHoverPanelScore`: Score in the left panel.
- `showVersionInPanel`: MOD version next to the left-panel score.
- `mapDecimals` / `panelDecimals`: Number of displayed decimal places.
- `specialistPipTextOffset`: Position of numbers on Specialist candidates.
- `specialistMinimumMapFontSize`: Minimum font size for Specialist candidates.
- `improvementBadgeScale` / `buildingBadgeScale`: Candidate badge sizes.
- `improvementPosition` / `buildingPosition`: Position adjustments for candidate displays.

## Other UI Mods

The production list display has been checked and adjusted in four configurations: this mod alone, with City Hall, with F1rstdan’s Cool UI, and with both.

In E order and W order, this mod determines the sorting order. In Default mode, it preserves the order provided by the game or another mod.

Compatibility with other UI mods has not been verified. If display problems occur, temporarily disable other UI mods, check this mod on its own, then re-enable the others one at a time to identify the conflict.

## Development and Diagnostics

Automated tests require Node.js.

```bash
npm test
```

Diagnostic logging is enabled by default. After exiting the game, check `UI.log` and `Modding.log`. This mod's log entries begin with `[Weighted Yield Scores]`. To disable logging, set `diagnostics` to `false` in `ui/config.js`.
