# Weighted Yield Scores

[日本語](README_JA.md)

Weighted Yield Scores is a UI mod that lets you assign a value to each yield and use those values to compare tile improvements, Specialist placements, and buildings instead of simply adding Food, Production, Gold, and other yields together.

For example, rather than treating 2 Food and 2 Production as equally valuable just because both are “2,” the mod converts each yield using its configured value and combines the results into a single comparison score. In this mod, assigning different values to different yields is called “weighting.”

You can freely change the value of each yield and use your own priorities when deciding where to assign Population and what to build where.

Building evaluations include not only the building's own yields, but also yields lost at the construction site and the best available reassignment for Population displaced when a Rural improvement is replaced. This allows buildings to be compared using the estimated change to the Settlement as a whole after construction.

## Features

- Displays a weighted value for each Rural tile and Specialist placement option when assigning Population
- Highlights the most valuable Population placement option in the City
- Sorts the building list by efficiency, taking both yield value and Production cost into account
- Highlights the most valuable placement option for each building
- Includes adjacency bonuses, Warehouse effects, maintenance costs, and yields lost through replacement
- Displays a breakdown of each yield and multiplier in tooltips

## Default valuation rates

By default, the following amounts are treated as equally valuable:

1 Influence = 2 Production = 4 Science = 4 Culture = 7 Gold = 10 Happiness

Food does not use a fixed multiplier by default. Its value is calculated dynamically for each Settlement using factors such as Population and the Food remaining until growth.

The approximate reference values at Standard game speed are shown below. Population is the combined total of Rural Population and Specialists.

| Population | Antiquity | Exploration | Modern |
| ---: | ---: | ---: | ---: |
| 2 | 2.27 | 1.43 | 1.04 |
| 6 | 1.08 | 0.76 | 0.57 |
| 10 | 0.72 | 0.53 | 0.41 |

When a Settlement has negative Happiness, the evaluation also accounts for the non-Food yield penalties that would be reduced by restoring Happiness. Any Happiness above zero is evaluated using only the standard multiplier.

For improvement options in Towns, the evaluation reflects the conversion of Production into Gold by valuing 1 Production with the same multiplier as 1 Gold.

Yield multipliers can be changed under **Options → Add-ons → Weighted Yield Scores Settings**.

## Acquiring resource tiles

For resources that can be assigned to slots, the mod calculates the yield provided while the resource is unassigned.

Other resource effects are not included in the evaluation.

As a result, resource tiles will generally be valued lower than their full practical value.

Improved resource evaluation is being considered for a future update.

## Compatibility

- UI-only; does not modify save data
- Can be enabled or disabled in existing save games
- Supports English and Japanese
- Compatibility with other UI mods has not yet been tested; verification and adjustments are planned

## Beta and bug reports

This mod is currently in beta. If you find a calculation or display issue, please report it through [GitHub Issues](https://github.com/mitoco93-blip/weighted-yield-scores/issues).

## Planned features

- Options to switch the building list between efficiency order and weighted-value order, disable sorting, and restore the game's original order
- More precise evaluation of acquired resource tiles
- Compatibility with additional UI mods
- Support for more special effects and placement conditions

If you would like to request another feature, please use [GitHub Issues](https://github.com/mitoco93-blip/weighted-yield-scores/issues). Features with strong demand will be prioritized when they are feasible.

## Changelog

### 0.4.0-beta.1 (release date TBD)

- Initial release

## Technical details

See the [technical notes](TECHNICAL_NOTES.md) for calculation methods and implementation details.

## Steam Workshop

Subscribe through Steam Workshop to install the mod.

Steam Workshop URL will be added after publication.
