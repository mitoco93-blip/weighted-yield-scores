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

For specialized Towns that send Food to Cities, dynamic Food values are calculated for each receiving City and averaged to obtain the Town value. Missing recipient data uses the configured fixed Food weight; if there are no recipients, the Town retains its local Food valuation. Fixed Food mode does not apply this dynamic recipient valuation.

## Dynamic Happiness Shortfall Adjustment

At Happiness levels of zero or above, 1 Happiness is valued as 0.2 Production. If a candidate causes settlement Happiness to become negative or recover from a negative value, a Happiness shortfall adjustment accounts for the change in non-Food settlement yields: 5% per point of Happiness, capped at 80%.

For example, if current Happiness is -3 and a candidate provides +5 Happiness, the evaluation adds the value of restoring settlement yields from a -15% penalty to no penalty, on top of the normal value of `5 × 0.2`. The remaining 2 points above zero receive no shortfall adjustment.

Government abilities tied to Happiness thresholds of 20 or 40 are not included.

## Resource Tile Valuation

The value of acquiring one additional resource is evaluated separately from the tile's own yields. Unassigned yields come from the game's `getUnassignedResourceYieldBonus`. Resource-specific effects use effect data for the current Age and the current state of the empire.

Slotted resources use the highest-value destination among settlements that meet assignment and trade-connection requirements. The mod does not optimize the entire allocation by rearranging existing resources.

```text
Resource value = Unassigned value + max(0, Optimal assignment value - Unassigned value) × Expected use
```

Expected use defaults to 50%. If another copy of the same resource is already unassigned, the unassigned value is used. Factory resources account for conditions such as Factory availability. Normal Empire and Treasure resource effects are evaluated for their applicable recipients; Treasure Fleet rewards are excluded.

Combat Strength bonuses use the share of currently owned military units affected by the bonus. Commanders and support units are excluded. The default Science-equivalent values of +1 Combat Strength are 2 in Antiquity, 4 in Exploration, and 6 in Modern, based on a comparison of diplomatic military and scientific support. Resource Combat Strength is capped at +6, and only the increase from the additional copy is valued. Healing defaults to 7.5 Science per +1 healing, based on a comparison of the final-tier Scientific and Militaristic attribute rewards.

Production bonuses use current City Production and configured shares of Production spending and eligible targets throughout the Age. These settings are separate from current army composition. Effects active only during celebrations use the configured share of time spent in celebrations.

Modern construction bonuses for Factories, Rail Stations, and Ports convert saved Production into a per-turn value by dividing it by the turns remaining until the expected Modern Age end. Production already invested in unfinished construction is ignored; unfinished buildings use the full construction cost obtained from the game. Defaults assume 80% of Cities build using Production, a construction deadline of turn 60, and an Age end at turn 80. Turns are entered at Standard speed and scaled to game speed. Construction bonuses add no value for an already completed target building or after the construction deadline.

Exploration Incense separates time spent assigned and used for eligible production from time spent unassigned. Destination Production uses the average across Cities in the empire. The default active share is 25%; time spent assigned but not used for eligible production is omitted. Additional Camel slots are valued through the gain from assigning eligible resources currently left unassigned.

Individual resource multipliers scale the value of each effect and default to 100%. If required state or costs cannot be obtained, details indicate omitted effects or other limitations.

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

Reassignment candidates prioritize the plots returned by the game's `EXPAND` command. If these are unavailable, candidates are reconstructed from current building placement data. If that is also unavailable, estimates are limited to unowned, empty tiles adjacent to the settlement's territory and within the growth domain returned by `getGrowthDomain(true)`. No frontier estimate is made if the growth domain cannot be obtained. Frontier estimates use standard improvement yields from `District_FreeConstructibles`, but exclude resource value because acquisition is unconfirmed. Future Warehouse, adjacency, and some conditional modifiers are not fully predicted.

The game's UI API does not return hypothetical yields for a Specialist slot that does not yet exist before a purchase. Purchase evaluations therefore also use only currently existing reassignment candidates, which can undervalue a purchase location when a newly created slot would be best. For construction, Population reassignment occurs before completion, so this limitation matches the actual sequence of play.

## Building List Efficiency Index

```text
E = round(Adjusted weighted value / Production-equivalent cost × 10,000)
```

Production uses the required Production cost obtained from the game. Purchases use the game's Gold purchase price, converted at 1 Gold = 2/7 Production. Purchase discounts and similar adjustments follow the price returned by the game. The 10,000 multiplier makes small fractions readable as integers without changing their ranking. The purchase conversion rate does not change when yield weights are edited.

When a supported overbuilding Production bonus is active, required Production is divided by `1 + Bonus percent / 100` to obtain the cost used for efficiency. For example, 175 Production with a +20% bonus gives an equivalent cost of 175 / 1.2 ≈ 145.83. This does not change the game's actual construction cost.

Supported effects are `GOVERNMENT_PLUTOCRACY` (+20%), `TRADITION_COMMUNE` (+20%), and `TRADITION_CIVIL_ENGINEERING` (+30%). Active bonuses are added, and the same Tradition is not counted twice. They apply when constructing an Urban building over another Urban building, not to purchases or repairs.

No finite efficiency index is calculated when the cost is unavailable or the equivalent cost is zero.

## Building List Sorting

- **E order**: Sorts by the efficiency index, highest first.
- **W order**: Sorts by weighted value, highest first.
- **Default**: Disables this mod's sorting and restores the order received from the game or another mod. W/E labels and yield corrections remain active.

The initial setting is E order. Your selection is saved. Items with equal E or W retain their original order. In E order and W order, items whose evaluation values are unavailable appear after evaluated items.

## Settings

Open the dedicated settings screen under **Options → Additional Content → Weighted Yield Scores settings**.

- Food valuation method: Switches between Dynamic and Fixed. The fixed Food weight field is disabled in Dynamic mode.
- Yield weights: Accept values from 0 to 3.
- Reset to default on each row: Resets only that yield to its default value.
- Reset all settings for this mod: Resets the Food mode and all yield weights.

Settings are saved and shared across all evaluations. If you change them during a game, close and reopen the evaluation screen.

Resource valuation is configured separately under **Options → Additional Content → Resource valuation settings**. It provides shared and Age-specific settings, plus Individual resource settings in a separate window. Ratio inputs are normalized against their total and saved when confirmed. Use Reset resource settings in this screen to restore resource defaults.

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

Normal diagnostic logging is enabled by default. Detailed investigation probes are disabled in release builds through `developmentProbes`. After exiting the game, check `UI.log` and `Modding.log`. This mod's log entries begin with `[Weighted Yield Scores]`. To disable logging, set `diagnostics` to `false` in `ui/config.js`.
