# Weighted Yield Scores Technical Notes

[日本語](TECHNICAL_NOTES_JA.md) | [Back to README](README.md)

Weighted Yield Scores is a UI mod that compares tile improvements, Specialist placements, and buildings in Civilization VII using weighted values based on player-configured exchange rates.

## Dynamic Food Valuation

Food is valued using assigned Population (Rural Population plus Specialists), current Food, the Food required for the next Population growth, the remaining evaluation horizon, and the yields of the best available choices. The mod estimates up to three Population growths. The evaluation period is capped at 60 turns, or the number of turns remaining in the game if fewer than 60 remain. Urban Population is not included in assigned Population.

The ratio between the current Food requirement reported by the game and the base growth curve is also applied to future Food requirements. Game speed and growth modifiers are therefore reflected through the actual requirement without identifying the selected speed by name.

The `foodValuation` section of `ui/config.js` contains the following tuning values:

- `candidateCount`: Number of top choices used to estimate future citizen value (default: 3)
- `horizonTurns`: Maximum evaluation period (default: 60 turns, or the number of turns remaining in the game if fewer than 60 remain)
- `maximumGrowths`: Maximum number of estimated Population growths (default: 3)
- `minimumWeight` / `maximumWeight`: Lower and upper bounds for the Production-equivalent value of 1 Food

The reference point at which 1 Food is valued as 1 Production is a next-growth requirement of approximately 315 Food. The actual value changes with the current growth cost, the value of available Population choices, and the evaluation horizon. When Food valuation is set to **Fixed**, the configured Food multiplier is always used.

## Dynamic Happiness Deficit Adjustment

At zero or positive Happiness, 1 Happiness is valued as 0.2 Production. If a choice makes Settlement Happiness negative or recovers it from a negative value, the score adds or subtracts a “Happiness deficit adjustment” representing a 5% change per point of Happiness, up to 80%, in all Settlement yields except Food.

For example, if current Happiness is -3 and a choice provides +5 Happiness, the value of restoring Settlement yields from a -15% penalty to 0% is added to the normal value of `5 × 0.2`. No deficit adjustment is applied to the remaining 2 Happiness above zero.

Government abilities that depend on the 20- and 40-Happiness thresholds are not evaluated.

## Resource Tile Evaluation

For a resource choice, the score includes the tile's own yields plus the minimum value of one resource immediately after acquisition while it is unassigned. This value is read from the game's `getUnassignedResourceYieldBonus`, so it reflects the current Age and rule modifiers.

Empire Resources and Treasure Resources without an unassigned bonus are excluded. Resource-specific effects produced after assignment to a slot are not currently added because their value varies significantly by choice.

## Improvement Estimate Accuracy

Specialist choices use the current values, post-assignment values, and maintenance values exposed by the game for every choice, so their list scores are exact. The yield difference is calculated using the following formula, with additional Food and Happiness maintenance included as negative values:

```text
(yields after assignment - current yields) + (current maintenance - maintenance after assignment)
```

Improvement list scores are estimates combining current terrain, feature, and resource yields with the static base yields of the automatically selected improvement. Dynamic modifiers from policies, civilization abilities, Warehouses, and conditional adjacency may not be fully available until a choice is hovered. The detailed view shown after hovering evaluates the complete yields of the candidate tile returned by the game.

## Building Evaluation

For each building, the mod scans every placement supplied by the game and evaluates the resulting yield differences, including adjacency bonuses, Warehouse effects, replacement of existing improvements, and maintenance costs.

When an Urban building replaces a Rural improvement, the total yield of the removed Rural tile is subtracted and the value of moving its Population to the highest-valued legal choice on the current map is added. During construction, Specialist slots belonging to the unfinished building are not considered available reassignment choices.

When an existing improvement is replaced by another improvement, as with some unique improvements, the Population and underlying standard improvement remain on the tile. No reassignment value is added, and the game's placement difference is used for the direct loss of the old improvement's yields.

When Lake of Kabbaka is replaced, adjacency yields caused by the lake state that are not included in the game's placement difference are read from `MapPlotYields`, and the measured value is additionally subtracted.

When two or more Urban buildings are replaced at once, the mod uses the District API to identify buildings that can actually be replaced, then adds any fixed-yield losses and removed maintenance not already calculated by the game. Buildings that remain after replacement, such as walls, are excluded.

If unowned Rural choices are unavailable in the normal building screen, the mod reconstructs unowned empty tiles adjacent to the Settlement's owned border and estimates the standard improvement using `District_FreeConstructibles`. This estimate includes terrain yields, fixed yields from the standard improvement, and the minimum resource value. It cannot fully predict future Warehouse, adjacency, or some conditional modifiers.

The game UI API does not provide hypothetical yields for one Specialist in a new Specialist slot before its building exists. Purchase evaluations therefore use only currently available reassignment choices and can undervalue a purchase when the new slot would be the best choice. During construction, reassignment occurs before completion, so this limitation matches actual progression.

## Shared Building-List Efficiency Index

Both the Production and purchase tabs use the following formula:

```text
shared efficiency index
= round(adjusted weighted value / remaining Production cost × 10,000)
```

The factor of 10,000 converts small decimals into readable integers and does not affect ranking. Purchase price and current per-turn Production are not included, so the same building has the same value and order in both tabs at the same moment. This is not a measure of actual Gold efficiency; it is a common index for comparing both tabs consistently.

## Settings

Open **Options → Add-ons → Weighted Yield Scores Settings**.

- Food valuation method: Switches between **Dynamic** and **Fixed**. The fixed Food multiplier field is disabled while Dynamic is selected.
- Yield multipliers: Accept values from 0 to 3.
- **Reset to Default** on each row: Resets only that yield.
- **Reset All Settings to Default**: Resets the Food method and every yield multiplier.

Settings are saved and shared by every evaluation. After changing them during a game, close and reopen the relevant evaluation screen.

## Display Configuration

The `display` section of `ui/config.js` contains the following options:

- `showMapScores`: Candidate scores on the map
- `showHoverPanelScore`: Score in the left panel
- `showVersionInPanel`: Mod version beside the left-panel score
- `mapDecimals` / `panelDecimals`: Displayed decimal places
- `specialistPipTextOffset`: Specialist score position
- `specialistMinimumMapFontSize`: Minimum Specialist score font size
- `improvementBadgeScale` / `buildingBadgeScale`: Candidate badge sizes
- `improvementPosition` / `buildingPosition`: Candidate display position adjustments

## Relationship with Other UI Mods

Compatibility with other UI mods has not yet been tested.

If a display problem occurs, temporarily disable other UI mods to isolate the cause, verify Weighted Yield Scores by itself, and then re-enable the other mods one at a time.

Do not keep multiple old folders with the same mod ID, because this makes it difficult to identify which version the game loaded.

## Development and Diagnostics

The automated tests require Node.js:

```bash
npm test
```

Diagnostic logging is enabled by default. After exiting the game, inspect `UI.log` and `Modding.log`. Log entries from this mod begin with `[Weighted Yield Scores]`. To disable logging when it is not needed, set `diagnostics` to `false` in `ui/config.js`.
