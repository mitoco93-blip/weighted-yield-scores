import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [i18n, settings, options, settingsEditor, englishOptionsText, japaneseOptionsText, config, runtime, happinessValuation, populationDetails, mapPatch, placePatch, recommendationPatch, buildingEvaluator, buildingDetails, buildingListName, buildingListScore, buildingPatch, productionPatch, productionTooltip, main, modinfo, readme, englishReadme, technicalNotes, japaneseTechnicalNotes, steamBuilder] = await Promise.all([
  read("ui/i18n.js"),
  read("ui/settings.js"),
  read("ui/options/weighted-yield-options.js"),
  read("ui/options/weighted-yield-settings-editor.js"),
  read("text/en_us/InGameText.xml"),
  read("text/ja_JP/InGameText.xml"),
  read("ui/config.js"),
  read("ui/runtime.js"),
  read("ui/happiness-valuation.js"),
  read("ui/population-details.js"),
  read("ui/patch-worker-yields-layer.js"),
  read("ui/patch-place-population.js"),
  read("ui/patch-acquire-tile-recommendation.js"),
  read("ui/building-evaluator.js"),
  read("ui/building-details.js"),
  read("ui/building-list-name.js"),
  read("ui/building-list-score.js"),
  read("ui/patch-building-placement.js"),
  read("ui/patch-production-chooser.js"),
  read("ui-next/tooltips/production-tooltip.js"),
  read("ui/main.js"),
  read("weighted-yield-scores.modinfo"),
  read("README_JA.md"),
  read("README.md"),
  read("TECHNICAL_NOTES.md"),
  read("TECHNICAL_NOTES_JA.md"),
  read("tools/build-steam.sh"),
]);
const packageMetadata = JSON.parse(await read("package.json"));

assert.equal(packageMetadata.version, "0.4.0-beta.2");
assert.match(config, /version:\s*"0\.4\.0-beta\.2"/);
assert.match(modinfo, /<Mod id="wys-weighted-yield-scores" version="94"/);
assert.match(modinfo, /<Version>0\.4\.0-beta\.2<\/Version>/);
assert.match(modinfo, /<Authors>mitoco93-blip<\/Authors>/);
assert.doesNotMatch(modinfo, /<References>|bz-city-hall/);
assert.match(readme, /^# Weighted Yield Scores$/m);
assert.match(englishReadme, /^# Weighted Yield Scores$/m);
assert.match(readme, /\[技術資料\]\(TECHNICAL_NOTES_JA\.md\)/);
assert.doesNotMatch(readme, /chatgpt\.com/);
assert.match(readme, /^## 更新履歴$/m);
assert.match(englishReadme, /^## Changelog$/m);
assert.match(readme, /^### 0\.4\.0-beta\.2（2026年9月18日）$/m);
assert.match(englishReadme, /^### 0\.4\.0-beta\.2 \(2026-09-18\)$/m);
assert.doesNotMatch(technicalNotes, /^## Changelog$/m);
assert.doesNotMatch(japaneseTechnicalNotes, /^## 更新履歴$/m);
assert.doesNotMatch(technicalNotes, /^## 0\.\d/m);
assert.doesNotMatch(japaneseTechnicalNotes, /^## 0\.\d/m);
assert.match(steamBuilder, /output_root="\$\{project_dir\}\/steam-upload"/);
assert.match(steamBuilder, /^\s*LICENSE \\/m);
assert.match(steamBuilder, /^\s*weighted-yield-scores\.modinfo \\/m);
assert.match(steamBuilder, /^\s*text \\/m);
assert.match(steamBuilder, /^\s*ui \\/m);
assert.match(steamBuilder, /^\s*ui-next$/m);
assert.doesNotMatch(steamBuilder, /README|TECHNICAL_NOTES|GitHub\.html|\.zip|release/);
assert.match(settings, /SHARED_STORAGE_KEY = "modSettings"/);
assert.match(settings, /root\[MOD_ID\] = data/);
assert.doesNotMatch(settings, /UI\?\.(?:getOption|setOption)/);
assert.doesNotMatch(settings, /saveCheckpoint/);
assert.match(settings, /YIELD_DIPLOMACY:\s*"influenceWeight"/);
assert.match(settings, /Math\.min\(3,/);
assert.match(settings, /resetOption\(optionID\)/);
assert.match(options, /CategoryType\.Mods/);
assert.match(options, /OptionType\.Editor/);
assert.match(options, /editorTagName:\s*"wys-settings-editor"/);
assert.doesNotMatch(options, /OptionType\.Slider/);
assert.match(settingsEditor, /Controls\.define\("wys-settings-editor"/);
assert.match(settingsEditor, /parseWeightInput/);
assert.match(settingsEditor, /number >= 0 && number <= 3/);
assert.match(settingsEditor, /input\.disabled = dynamic/);
assert.match(settingsEditor, /resetOne\(optionID\)/);
assert.match(settingsEditor, /WeightedYieldSettings\.reset\(\)/);
assert.match(settingsEditor, /LOC_OPTIONS_WYS_RESET_ALL/);
assert.match(settingsEditor, /wys-locale-ja \.wys-setting-row--food/);
assert.match(settingsEditor, /padding-left:\s*7rem/);
assert.match(settingsEditor, /width:\s*11rem;\s*text-align:\s*right/);
assert.match(settingsEditor, /\.wys-settings-content\s*\{[\s\S]*padding-top:\s*3rem/);
assert.match(settingsEditor, /\.wys-weight-input\s*\{[\s\S]*width:\s*9rem;[\s\S]*height:\s*2\.5rem/);
assert.match(settingsEditor, /\.wys-weight-input\s*\{[\s\S]*border:\s*0\.1rem solid rgba\(0, 0, 0, 0\.95\)/);
assert.match(settingsEditor, /\.wys-weight-input\s*\{[\s\S]*background-color:\s*rgba\(0, 0, 0, 0\.72\)/);
assert.match(settingsEditor, /\.wys-weight-input\s*\{[\s\S]*box-shadow:\s*none/);
assert.match(settingsEditor, /\.wys-weight-input:focus\s*\{[\s\S]*border-color:\s*#d6b66f/);
assert.match(settingsEditor, /<input class="wys-weight-input font-body text-base"/);
assert.match(settingsEditor, /inputmode="decimal"/);
assert.match(settingsEditor, /addEventListener\("input", changed\)/);
assert.match(settingsEditor, /addEventListener\("blur", blurred\)/);
assert.doesNotMatch(settingsEditor, /fxs-textbox/);
assert.doesNotMatch(settingsEditor, /TextBoxTextChangedEventName|TextBoxTextEditStopEventName/);
assert.doesNotMatch(settingsEditor, /wys-weight-input-wrap/);
assert.doesNotMatch(settingsEditor, /rgba\(255|#fff|#ffffff/i);
assert.match(settingsEditor, /Locale\.compose\("LOC_OPTIONS_WYS_FOOD_MODE"\) === "食料の評価方式"/);
assert.doesNotMatch(settingsEditor, /display:\s*grid/);
assert.match(englishOptionsText, /LOC_OPTIONS_GROUP_WYS_WEIGHTED_YIELD_SCORES/);
assert.match(englishOptionsText, />Weighted Yield Scores</);
assert.match(englishOptionsText, />Reset all settings for this mod</);
assert.match(japaneseOptionsText, /Language="ja_JP"/);
assert.match(japaneseOptionsText, />重み付き産出スコア</);
assert.match(japaneseOptionsText, />すべての設定を初期値に戻す</);
assert.doesNotMatch(japaneseOptionsText, />このMODのすべての設定をリセット</);
assert.match(japaneseOptionsText, />食料の固定倍率</);
assert.doesNotMatch(japaneseOptionsText, /食料の倍率（固定時）/);
assert.match(config, /WeightedYieldSettings\.useDynamicFood/);
assert.match(config, /WeightedYieldSettings\.getWeights/);
assert.match(modinfo, /scope="shell"[\s\S]*ui\/options\/weighted-yield-options\.js/);
assert.match(modinfo, /scope="game"[\s\S]*ui\/options\/weighted-yield-options\.js/);
assert.equal(
  modinfo.match(/text\/en_us\/InGameText\.xml/g)?.length,
  2,
);
assert.equal(
  modinfo.match(/text\/ja_JP\/InGameText\.xml/g)?.length,
  2,
);

// Guard the two bugs observed in the 0.1.3 screenshots.
assert.match(runtime, /const resultingRecord = parseYieldDeltas\(rawYieldDeltas\)/);
assert.doesNotMatch(
  runtime,
  /addYieldRecords\(naturalRecord,\s*exact(?:Delta)?Record\)/,
);
assert.match(mapPatch, /const text = compactScore\(value\)/);
assert.doesNotMatch(mapPatch, /weightedMapLabel|rawMapLabel|sumYieldRecord/);
assert.match(mapPatch, /visualizer\?\.backgroundSpriteGrid/);
assert.match(mapPatch, /currentGrid\.addText\(location, text, anchor/);
assert.ok(
  mapPatch.indexOf("currentGrid.addText") <
    mapPatch.indexOf("visualizer.addText(plotIndex"),
  "The direct SpriteGrid text path must run before the blank high-level fallback.",
);
assert.match(mapPatch, /function getNextSpecialistPipPosition/);
assert.match(mapPatch, /drawTextOnExistingSprite\(/);
assert.match(mapPatch, /visualizer\?\.foregroundSpriteGrid/);
assert.match(mapPatch, /numberOrZero\(info\?\.MaxWorkers\)/);
assert.match(mapPatch, /anchorX:\s*numberOrZero\(pipOffset\?\.xOffset/);
assert.match(mapPatch, /anchorY:\s*numberOrZero\(pipOffset\?\.yOffset/);
assert.match(mapPatch, /offsetX:/);
assert.match(mapPatch, /offsetY:/);
assert.match(mapPatch, /offset,\s*\n\s*\}\);/);
assert.match(config, /plotOffset:\s*\{ x: 0, y: -10, z: 0 \}/);
assert.match(config, /screenOffset:\s*\{ x: 0, y: -10 \}/);
assert.doesNotMatch(config, /y:\s*34|z:\s*30/);
assert.doesNotMatch(config, /specialistBadgeOffset|specialistBadgeSpacing/);
assert.match(mapPatch, /realizeGrowthPlots\(\)/);
assert.match(mapPatch, /delay:\s*250,\s*realizeAll:\s*true/);
assert.match(runtime, /detail:\s*\{ kind, reason, generation:/);
assert.match(runtime, /notifyScoreCache\("improvement", "hover"\)/);
assert.match(runtime, /YIELD_PRODUCTION:\s*"YIELD_GOLD"/);
assert.match(runtime, /previous\.isTown === isTown/);
assert.match(config, /productionUsesGoldRate:\s*true/);
assert.match(config, /weightedMapFontSize:\s*6/);
assert.match(config, /improvementBadgeScale:\s*1\.16/);
assert.match(config, /mapTextColor:\s*0xffffffff/);
assert.match(config, /foodValuation:\s*\{/);
assert.match(config, /happinessValuation:\s*\{/);
assert.match(config, /penaltyPerPoint:\s*0\.05/);
assert.match(config, /maximumPenalty:\s*0\.8/);
assert.match(happinessValuation, /function getNegativeHappinessPenalty/);
assert.match(happinessValuation, /function evaluateHappinessDeficitAdjustment/);
assert.match(runtime, /getYield\?\.\(happinessIndex\)/);
assert.match(runtime, /penaltyFreeWeightedOutput/);
assert.match(runtime, /happinessAdjustment/);
assert.match(runtime, /city\?\.ruralPopulation/);
assert.match(runtime, /getNumWorkers\?\.\(false\)/);
assert.match(runtime, /getNextGrowthFoodThreshold/);
assert.match(placePatch, /t\("weighted"\)/);
assert.match(placePatch, /t\("foodInline"/);
assert.match(placePatch, /whiteSpace = "nowrap"/);
assert.match(placePatch, /getPopulationEvaluationDetailModel/);
assert.match(placePatch, /improvementMaximizedContainer/);
assert.match(placePatch, /specialistMaximizedContainer/);
assert.match(placePatch, /data-wys-population-details/);
assert.match(placePatch, /Locale\?\.stylize/);
assert.match(populationDetails, /title: kind === "specialist"/);
assert.match(populationDetails, /t\("weightedValueHeading"\)/);
assert.match(populationDetails, /t\("foodMultiplier"/);
assert.match(runtime, /function applyImprovementScore/);
assert.doesNotMatch(placePatch, /配置人口|ターン評価|生産力=1/);
assert.match(config, /showVersionInPanel:\s*false/);
assert.match(config, /resourceValuation:\s*\{/);
assert.match(runtime, /getUnassignedResourceYieldBonus/);
assert.match(runtime, /GameplayMap\?\.getResourceType/);
assert.match(config, /RESOURCECLASS_EMPIRE/);
assert.match(config, /RESOURCECLASS_TREASURE/);

// Recommendation rings replace City Hall's simple-total ring when available
// and fall back to an independent model group without City Hall.
assert.match(recommendationPatch, /handler\?\.growthModelGroup/);
assert.match(recommendationPatch, /wysWeightedRecommendationModelGroup/);
assert.match(recommendationPatch, /getBestPlotIndexes/);
assert.match(recommendationPatch, /mergeRecommendationCandidates\(improvements, specialists\)/);
assert.match(recommendationPatch, /handler\.validPlots/);
assert.match(recommendationPatch, /city\.isTown/);
assert.match(recommendationPatch, /WeightedYieldRuntime\.getPlacementImprovementScore/);
assert.match(recommendationPatch, /WeightedYieldRuntime\.getSpecialistScore/);
assert.match(recommendationPatch, /VFX_3dUI_Tut_SelectThis_01/);
assert.match(main, /patch-acquire-tile-recommendation\.js/);
assert.match(main, /patch-building-placement\.js/);
assert.match(main, /patch-production-chooser\.js/);

// Building placement uses the engine's complete placement deltas, applies
// maintenance, restores a displaced rural citizen at the best current legal
// destination, and ranks every placement rather than the vanilla raw-total pick.
assert.match(config, /buildingValuation:\s*\{/);
assert.match(buildingEvaluator, /placement\?\.yieldChanges/);
assert.match(buildingEvaluator, /getMaintenance/);
assert.match(buildingEvaluator, /District_FreeConstructibles/);
assert.match(buildingEvaluator, /Constructible_YieldChanges/);
assert.match(buildingEvaluator, /isRuralReplacement/);
assert.match(buildingEvaluator, /DistrictTypes\?\.RURAL/);
assert.match(buildingEvaluator, /forceRuralReplacement/);
assert.match(buildingEvaluator, /selectBestRelocationCandidate/);
assert.match(buildingEvaluator, /correctedRecord/);
assert.match(buildingEvaluator, /IMPROVEMENT_KABAKAS_LAKE/);
assert.match(buildingEvaluator, /MapPlotYields\?\.getYieldsModifiers/);
assert.match(buildingEvaluator, /YieldSourceTypes\?\.ADJACENCY/);
assert.doesNotMatch(
  buildingEvaluator,
  /getConstructibleStaticYieldRecord\(overwrittenImprovement\)/,
);
assert.doesNotMatch(buildingEvaluator, /getOverbuildableConstructibleTypes/);
assert.doesNotMatch(buildingEvaluator, /getMissedBuildingOverbuildRecord/);
assert.doesNotMatch(buildingEvaluator, /missedBuildingOverbuildRecord/);
assert.doesNotMatch(buildingPatch, /building-diagnostics/);
assert.doesNotMatch(buildingPatch, /logTwoBuildingReplacementDiagnostic/);
assert.match(buildingEvaluator, /complete: !ruralReplacement \|\| Boolean\(relocation\)/);
assert.match(buildingEvaluator, /entry\?\.complete !== false/);
assert.match(runtime, /refreshBuildingCandidates\(cityID, allPlacementData\)/);
assert.match(runtime, /refreshImprovementScoresFromPlacementData/);
assert.match(runtime, /arrayToYieldRecord\(placement\?\.yieldChanges/);
assert.match(runtime, /function getFrontierPlotIndexes/);
assert.match(runtime, /District_FreeConstructibles/);
assert.match(runtime, /function refreshImprovementScoresFromFrontier/);
assert.match(runtime, /inferredFromFrontier:\s*true/);
assert.match(buildingPatch, /getPlacementOptions = function/);
assert.match(buildingPatch, /VFX_3dUI_Tut_SelectThis_01/);
assert.match(buildingPatch, /t\("relocation"\)/);
assert.match(buildingPatch, /refreshBuildingCandidates/);
assert.match(buildingPatch, /new Set\(BuildingPlacementManager\.developedPlots/);
assert.match(buildingPatch, /forceRuralReplacement: developedPlots\.has\(plotIndex\)/);
assert.match(buildingPatch, /display\.buildingBadgeScale/);
assert.match(productionPatch, /selectBestBuildingPlacement/);
assert.match(productionPatch, /calculateBuildingPriority/);
assert.match(productionPatch, /refreshBuildingCandidates/);
assert.match(productionPatch, /getConstructibleProductionCost/);
assert.doesNotMatch(productionPatch, /decorateItemName/);
assert.doesNotMatch(productionPatch, /item\.name\s*=/);
assert.match(productionPatch, /applyFixedBuildingListName\(item\)/);
assert.match(buildingListName, /"ポルタル・デ・メルカデレス"/);
assert.match(buildingListName, /"ポルタル・デ・メル…"/);
assert.doesNotMatch(buildingListName, /"黄金時代のアカデミー"/);
assert.doesNotMatch(buildingListName, /"黄金時代のアカデ…"/);
assert.doesNotMatch(buildingListName, /"黄金時代の円形闘技場"/);
assert.doesNotMatch(buildingListName, /"黄金時代の円形闘…"/);
assert.doesNotMatch(buildingListName, /"Portal de Mercaderes"/);
assert.doesNotMatch(buildingListName, /"Golden Age Academy"/);
assert.doesNotMatch(buildingListName, /"Golden Age Amphitheater"/);
assert.doesNotMatch(
  buildingListName,
  /getBoundingClientRect|textOverflow|ellipsis/,
);
assert.match(productionPatch, /scheduleBuildingListScoreSync/);
assert.match(productionPatch, /itemElementMap/);
assert.match(productionPatch, /renderBuildingListScore/);
assert.match(productionPatch, /clearBuildingListScore/);
assert.match(buildingListScore, /data-wys-building-list-score/);
assert.match(buildingListScore, /scoreParent\.append\?\.\(scoreElement\)/);
assert.match(buildingListScore, /font-body/);
assert.match(buildingListScore, /display = "block"/);
assert.match(buildingListScore, /whiteSpace = "nowrap"/);
assert.match(buildingListScore, /flexShrink = "0"/);
assert.equal(
  buildingListScore.match(/fontSize = "0\.8em"/g)?.length,
  1,
  "W, separator and E inherit the common wrapper font size",
);
assert.match(buildingListScore, /fontWeight = "700"/);
assert.doesNotMatch(buildingListScore, /innerHTML/);
assert.doesNotMatch(productionPatch, /compactScoreHTML|｜効率/);
assert.doesNotMatch(productionPatch, /weightedTooltipDescription/);
assert.doesNotMatch(productionPatch, /item\.description =/);
assert.match(productionPatch, /correctedYieldDetailsHTML/);
assert.match(productionPatch, /BuildingPlacementManager\.initializePlacementData\(city\.id\)/);
assert.doesNotMatch(productionPatch, /Controls\.decorate\(\s*"constructible-details"/);
assert.doesNotMatch(productionPatch, /decorateExistingDetails/);
assert.match(productionPatch, /getLatestBuildingEvaluation/);
assert.match(productionPatch, /getBuildingTooltipModel/);
assert.match(productionPatch, /WeightedYieldScoresProduction/);
assert.match(productionPatch, /getTooltipModel:\s*getBuildingTooltipModel/);
assert.doesNotMatch(productionPatch, /MutationObserver/);
assert.match(productionPatch, /getBuildingEvaluationDetailModel/);
assert.match(buildingDetails, /t\("relocationDestination"/);
assert.match(buildingDetails, /title:\s*t\("buildingEvaluation"\)/);
assert.match(buildingDetails, /summary:\s*""/);
assert.match(buildingDetails, /function contributionExpression/);
assert.match(buildingDetails, /terms\.join\(additionSeparator\(\)\)/);
assert.match(buildingDetails, /Math\.abs\(weight - 1\) < 1e-9/);
assert.match(buildingDetails, /t\("weightedValueHeading"\)/);
assert.match(buildingDetails, /× \$\{formatScore\(scale, 0\)\} \$\{equationEquals\(\)\}/);
assert.match(i18n, /weightedValueHeading: "\[B\]Weighted Value \(W\)\[\/B\]"/);
assert.match(i18n, /foodInline: " \| Food ×\{value\}"/);
assert.match(i18n, /weightedValueHeading: "\[B\]【重み付き価値（W）】\[\/B\]"/);
assert.match(i18n, /efficiencyHeading: "\[B\]Efficiency \(E\)\[\/B\]"/);
assert.match(i18n, /efficiencyHeading: "\[B\]【効率（E）】\[\/B\]"/);
assert.match(buildingDetails, /getBuildingListScoreParts/);
assert.match(buildingDetails, /t\("relocationYield"/);
assert.match(buildingDetails, /\[icon:YIELD_PRODUCTION\]/);
assert.match(buildingDetails, /t\("happinessBreakdown"\)/);
assert.match(buildingDetails, /t\("happinessValue"/);
assert.match(i18n, /buildingEvaluation: "Building Evaluation"/);
assert.match(i18n, /buildingEvaluation: "建造物評価"/);
assert.doesNotMatch(buildingDetails, /"回復率"|"追加低下率"/);
assert.doesNotMatch(productionPatch, /購入効率（100G）/);
assert.doesNotMatch(productionPatch, /建設効率（1ターン）/);
assert.doesNotMatch(productionPatch, /<div class="wys-building-list-score/);
assert.match(modinfo, /<ImportFiles>[\s\S]*ui-next\/tooltips\/production-tooltip\.js/);
assert.match(productionTooltip, /getWeightedBuildingTooltipModel/);
assert.match(productionTooltip, /WeightedYieldScoresProduction/);
assert.match(productionTooltip, /data-wys-building-tooltip/);
assert.match(productionTooltip, /createComponent\(L10n\.Stylize/);
assert.match(productionTooltip, /replace\(\/\\n\/g, "\[N\]"\)/);
assert.match(
  config,
  /buildingPosition:[\s\S]*plotOffset:\s*\{ x: 0, y: 0, z: 0 \}[\s\S]*screenOffset:\s*\{ x: 0, y: 0 \}[\s\S]*textOffset:[\s\S]*city:\s*\{ x: 0, y: -0\.5 \}[\s\S]*town:\s*\{ x: 0, y: -0\.2 \}[\s\S]*ruralReplacementTextOffset:[\s\S]*city:\s*\{ x: 0, y: 0\.25 \}[\s\S]*town:\s*\{ x: 0, y: 0\.2 \}[\s\S]*horizontalGap:\s*12[\s\S]*gainRowY:\s*6[\s\S]*lossRowY:\s*-10/,
);
assert.match(config, /buildingBadgeScale:\s*1\.1/);
assert.doesNotMatch(config, /buildingScorePlate/);
assert.doesNotMatch(config, /yield_arrow_positive/);
assert.doesNotMatch(config, /hud_sub_circle_/);
assert.match(
  buildingPatch,
  /WeightedYieldConfig\.display\.mapBadgeIcon \?\? "hud_mini_lens_btn"/,
);
assert.match(buildingPatch, /scale: WeightedYieldConfig\.display\.buildingBadgeScale/);
assert.doesNotMatch(buildingPatch, /addNativeScorePlate/);
assert.doesNotMatch(buildingPatch, /yield_arrow_positive/);
assert.doesNotMatch(buildingPatch, /hud_sub_circle_/);
assert.doesNotMatch(modinfo, /wys_score_plate_/);
assert.doesNotMatch(modinfo, /<UpdateIcons>/);
assert.match(buildingPatch, /function getScoreBadgeOffset/);
assert.match(buildingPatch, /getXYOffsetForPill/);
assert.match(
  buildingPatch,
  /gainCount > 0 \? gainCount : Math\.max\(lossCount, 1\)/,
);
assert.doesNotMatch(buildingPatch, /Math\.max\(gainCount, lossCount, 1\)/);
assert.match(buildingPatch, /data-wys-building-placement-details/);
assert.match(buildingPatch, /view === this\.component\.maximizedDiv/);
assert.match(buildingPatch, /getBuildingEvaluationDetailModel\(evaluation\)/);
assert.match(buildingPatch, /model\.breakdown\.replace\(\/\\n\/g, "\[N\]"\)/);
assert.match(buildingPatch, /Locale\?\.stylize\?\.\(breakdownMarkup\)/);
assert.match(buildingPatch, /details\.breakdown\.innerHTML = stylizedBreakdown/);
assert.match(buildingPatch, /function scoreLabel/);
assert.match(buildingPatch, /return `\$\{t\("weighted"\)\} \$\{score\}`/);
assert.match(buildingPatch, /yieldVisualizer\?\.foregroundSpriteGrid/);
assert.match(buildingPatch, /foregroundGrid\.addText\(location, text, anchor/);
assert.match(buildingPatch, /city\?\.isTown/);
assert.match(buildingPatch, /configured\?\.textOffset\?\.town/);
assert.match(buildingPatch, /configured\?\.textOffset\?\.city/);
assert.match(buildingPatch, /evaluation\.ruralReplacement/);
assert.match(buildingPatch, /configured\?\.ruralReplacementTextOffset\?\.town/);
assert.match(buildingPatch, /configured\?\.ruralReplacementTextOffset\?\.city/);
assert.equal(
  buildingPatch.match(/numberOrZero\(replacementTextOffset\?\.[xy]\)/g)?.length,
  2,
  "Rural replacement text offset must be applied on both axes.",
);
assert.match(buildingPatch, /offset: textOffset/);
assert.match(config, /priorityScale:\s*10000/);
assert.match(buildingPatch, /querySelectorAll\("yield-bar-base"\)/);
assert.match(buildingPatch, /yieldBars\[yieldBars\.length - 1\]/);
assert.match(buildingPatch, /insertAdjacentElement\("beforebegin", element\)/);
assert.match(runtime, /return scores\.size > 0/);
assert.match(runtime, /calculateAllBuildingsPlacements already contains only legal plots/);

// Improvement candidates must refresh from the improvement-screen lifecycle.
assert.match(placePatch, /prototype\.updateExpandPlots/);
assert.match(placePatch, /WeightedYieldRuntime\.refreshImprovements\(cityID,/);

console.log("Weighted Yield Scores project checks passed.");
