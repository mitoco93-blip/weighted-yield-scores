# Weighted Yield Scores

Weighted Yield Scores is a UI mod for Civilization VII that lets you compare tile improvements, Specialist placements, and buildings using your own priorities for each yield, rather than simply adding Food, Production, Gold, and other yields together.

For example, instead of treating 2 Food and 2 Production as the same two points, the mod converts each into its assigned value and combines them into a single score. This is what the mod calls "weighting" yields.

You can change the value of each yield to help decide where to place Population and what to build where, based on your own preferences.

Building evaluations account for more than the building's own yields. They also include yields lost at the construction site and the destination of Population displaced when a Rural improvement is replaced. This lets you compare the overall change to the settlement after construction.

## Main Features

- Shows weighted values for Rural tiles and Specialist candidates when placing Population.
- Highlights the highest-value Population placement in a City.
- Lets you switch the building list between efficiency order (E order), weighted-value order (W order), and Default order.
- Highlights the highest-value location for a building.
- Accounts for adjacency bonuses, Warehouse effects, maintenance, and yields lost through overbuilding.
- Shows a breakdown of yields and weights in tooltips.

## Reading and Sorting the Building List

Each building name is followed by its weighted value, **W**, and efficiency, **E**.

- **W (Weighted Value)**: The change in yields converted using your configured weights. This also accounts for maintenance, Population reassignment when a Rural improvement is replaced, and the effects of acquiring resources.
- **E (Efficiency)**: W divided by the construction cost expressed in Production, multiplied by 10,000. Building with Production uses the required Production; purchasing uses the required Gold, converted at 1 Gold = 2/7 Production. Overbuilding Production bonuses from supported Governments and Traditions are also reflected in the efficiency calculation.

Use the buttons in the list header to switch the sorting mode. Your selection is saved.

| Sorting Mode | Behavior |
| --- | --- |
| E order (initial setting) | Highest efficiency first |
| W order | Highest weighted value first |
| Default | Disables this mod's sorting and restores the order provided by the game or another mod |

To save space, the Ageless label on Warehouse buildings and other Ageless buildings is displayed as an icon.

## Default Valuation Rates

By default, each point of yield is valued using the following weights, with 1 Production as the baseline.

**Influence: 2 / Production: 1 / Science: 0.5 / Culture: 0.5 / Gold: approximately 0.286 / Happiness: 0.2**

A higher weight means greater value per point of yield.

Food uses a dynamic value by default, rather than a fixed weight. Its value is calculated for each settlement based on factors such as Population and the Food remaining until growth.

The following table gives approximate reference values at Standard speed. Population here means Rural Population plus Specialists.

| Population | Antiquity | Exploration | Modern |
| --- | --- | --- | --- |
| 2 | 2.27 | 1.43 | 1.04 |
| 6 | 1.08 | 0.76 | 0.57 |
| 10 | 0.72 | 0.53 | 0.41 |

In settlements with negative Happiness, the evaluation also includes the reduction in non-Food yield penalties gained by restoring Happiness. Happiness above zero is evaluated using only its normal weight.

For improvement candidates in Towns, 1 Production is valued at the same weight as 1 Gold, reflecting the conversion of Production into Gold.

Food sent from specialized Towns to Cities is valued using the Food value in the receiving Cities. If there are multiple receiving Cities, their Food values are averaged. This applies when dynamic Food valuation is enabled.

You can change yield weights under **Options → Additional Content → Weighted Yield Scores settings**.

## Acquiring Resource Tiles

The effects of acquiring resources, such as yield increases, Production bonuses, and Combat Strength, are converted into a comparison score and added to the evaluation. The details show the resource name and its value.

Resources assigned to slots are valued between their unassigned value and their value under optimal assignment, using the Expected use of slotted resources setting. The default of 50% uses the midpoint between these values.

Under **Options → Additional Content → Resource valuation settings**, you can change assumptions such as Production spending and Combat Strength value for each Age. Individual resource settings lets you change the valuation multiplier for each effect; the default is 100%. Hover over the ⓘ beside a setting for an explanation of its meaning and calculation.

Resource values are comparison estimates based on the current state of your empire and your expected use settings. Treasure Fleet rewards are not included. If required information cannot be obtained and an effect is omitted from the calculation, the details explain why.

## Compatibility

- This is a UI mod that does not modify save data.
- It can be enabled or disabled for existing saves.
- English and Japanese are supported.
- The production list display has been checked and adjusted in four configurations: this mod alone, with City Hall, with F1rstdan’s Cool UI, and with both.

Compatibility with other UI mods has not been verified.

## Beta and Bug Reports

This mod is currently in beta. Please report calculation or display problems through [GitHub Issues](https://github.com/mitoco93-blip/weighted-yield-scores/issues).

## Features Under Consideration

- Valuation of Wonders themselves.
- Compatibility with additional UI mods.
- Support for special effects of buildings, Unique Buildings, and Unique Quarters.

If there are other features you would like, please suggest them through [GitHub Issues](https://github.com/mitoco93-blip/weighted-yield-scores/issues). Frequently requested, feasible improvements will be prioritized.

## Changelog

### 0.4.0-beta.3 (2026-10-11)

#### Additions

- Added valuation of resource effects such as yields, Production bonuses, and Combat Strength when acquiring resources.
- Added resource valuation settings, including expected use by Age and valuation multipliers for individual resources.

#### Fixes

- Fixed building efficiency calculations to account for purchase costs and overbuilding Production bonuses.
- Fixed the valuation of Food sent from specialized Towns to use Food values in the receiving Cities.
- Fixed tile details disappearing during consecutive Population growth events within the same open screen.

### 0.4.0-beta.2 (2026-09-18)

#### Additions and Improvements

- Added E order, W order, and Default sorting modes to the building list.
- Improved the production list display when used with City Hall and Cool UI.
- Made yield icons and values more compact and adjusted the placement of Production costs and turns remaining.
- Replaced the Ageless label with the game's official icon and a tooltip.

#### Bug Fixes

- Fixed tile scores not appearing until hovered over when Population increases through a Migrant.
- Fixed scores and recommendations appearing on tiles that cannot receive reassigned Population.
- Fixed incorrect evaluations when multiple buildings were eligible for overbuilding, caused by including the yields and maintenance of buildings that would remain.

### 0.4.0-beta.1 (2026-08-07)

- Initial release.

## Detailed Specifications

See the [technical notes](TECHNICAL_NOTES.md) for calculation methods and other details.

## Steam Workshop

Subscribe through the [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3779121419) to install the mod.
