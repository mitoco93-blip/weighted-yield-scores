const TRANSLATIONS = {
  en: {
    excludeRuralImpacts: "Exclude rural",
    excludeRuralImpactsHint: "Temporarily exclude yield losses from removing rural improvements and yield gains from relocating population from the evaluation.",
    sortBuildings: "Building order",
    sortEfficiency: "E order",
    sortWeighted: "W order",
    sortDefault: "Default",
    sortEfficiencyHint: "Highest efficiency (E) first",
    sortWeightedHint: "Highest weighted value (W) first",
    sortDefaultHint: "Restore the original order; keep scores and yield corrections",
    approximate: "approx. ",
    relocationEstimateHint: "Relocation destination is estimated; resource acquisition is not confirmed and is excluded.",
    buildingEvaluation: "Building Evaluation",
    efficiencyHeading: "[B]Efficiency (E)[/B]",
    overbuildCostConversion: "Overbuild production +{percent}% ({sources}): {cost} [icon:YIELD_PRODUCTION] ÷ {multiplier} ≈ {production} [icon:YIELD_PRODUCTION]",
    overbuildBonusUnavailable: "Overbuild bonus could not be read; efficiency uses the unadjusted production cost.",
    purchaseCostConversion: "Purchase cost: {gold} [icon:YIELD_GOLD] × 2/7 ≈ {production} [icon:YIELD_PRODUCTION]",
    evaluatingRelocation: "Evaluating relocation options",
    foodMultiplier: "Food multiplier: ×{value}",
    exportFoodMultiplier: "Food multiplier: ×{value} (average across {count} recipient cities)",
    foodInline: " | Food ×{value}",
    happinessAdjustment: "Happiness shortfall adjustment",
    happinessBreakdown: "Happiness shortfall adjustment breakdown",
    happinessChange: "Happiness change: {before} {operator} {delta} → {after}",
    happinessValue:
      "Happiness shortfall adjustment: pre-penalty weighted yield {output} × {rate} = {value}",
    noChange: "No change",
    relocation: "Relocation",
    relocationDestination: "Relocation destination: {destination}",
    relocationYield: "Relocation yields ({expression})",
    rural: "Rural",
    ruralPlacementEvaluation: "Rural Placement Evaluation",
    ruralWithImprovement: "Rural ({improvement})",
    scoreAria: "Weighted value W{weighted}, efficiency E{efficiency}",
    specialist: "Specialist",
    specialistPlacementEvaluation: "Specialist Placement Evaluation",
    weighted: "Weighted Value",
    weightedValueHeading: "[B]Weighted Value (W)[/B]",
    yieldPenalty: "Yield penalty: {before} → {after} ({change})",
  },
  ja: {
    relocationEstimateHint: "※再配置先は推定です。取得可否を確認できない資源の効果は加算していません。",
    excludeRuralImpacts: "郊外影響を除外",
    excludeRuralImpactsHint: "郊外施設を失う産出減と、人口再配置による産出増を、評価から一時的に除外します。",
    sortBuildings: "建物の並び順",
    sortEfficiency: "E順",
    sortWeighted: "W順",
    sortDefault: "デフォルト",
    sortEfficiencyHint: "効率（E）の高い順",
    sortWeightedHint: "重み付き価値（W）の高い順",
    sortDefaultHint: "元の並び順に戻す。スコア表示・産出補正は維持",
    approximate: "約",
    buildingEvaluation: "建造物評価",
    efficiencyHeading: "[B]【効率（E）】[/B]",
    overbuildCostConversion: "改築生産＋{percent}%（{sources}）：{cost} [icon:YIELD_PRODUCTION] ÷ {multiplier} ≈ {production} [icon:YIELD_PRODUCTION]",
    overbuildBonusUnavailable: "※改築ボーナスを取得できないため、効率は補正前の生産コストで評価しています。",
    purchaseCostConversion: "購入費用：{gold} [icon:YIELD_GOLD] × 2/7 ≈ {production} [icon:YIELD_PRODUCTION]",
    evaluatingRelocation: "再配置候補を評価中",
    foodMultiplier: "※食料倍率：×{value}",
    exportFoodMultiplier: "※食料倍率：×{value}（送り先の{count}都市の平均）",
    foodInline: "　食料×{value}",
    happinessAdjustment: "幸福度不足補正",
    happinessBreakdown: "※幸福度不足補正の内訳",
    happinessChange: "幸福度変化：{before} {operator} {delta} → {after}",
    happinessValue:
      "幸福度不足補正値：ペナルティ前の重み付き産出 {output} × {rate} ＝ {value}",
    noChange: "変化なし",
    relocation: "再配置",
    relocationDestination: "※再配置先：{destination}",
    relocationYield: "再配置産出（{expression}）",
    rural: "郊外",
    ruralPlacementEvaluation: "郊外配置評価",
    ruralWithImprovement: "郊外（{improvement}）",
    scoreAria: "重み付き価値 W{weighted}、効率 E{efficiency}",
    specialist: "専門家",
    specialistPlacementEvaluation: "専門家配置評価",
    weighted: "重み付き",
    weightedValueHeading: "[B]【重み付き価値（W）】[/B]",
    yieldPenalty: "産出ペナルティ：{before} → {after}（{change}）",
  },
};

const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u9fff]/u;

function composedProbe(locale) {
  for (const key of ["LOC_YIELD_FOOD", "LOC_YIELD_PRODUCTION"]) {
    try {
      const value = locale?.compose?.(key);
      if (value != null && String(value) !== key) return String(value);
    } catch {
      // A missing locale service should fall back to English.
    }
  }
  return "";
}

export function getModLanguage(locale = globalThis.Locale) {
  return JAPANESE_PATTERN.test(composedProbe(locale)) ? "ja" : "en";
}

export function t(key, values = {}, locale = globalThis.Locale) {
  const language = getModLanguage(locale);
  const template = TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) =>
    values[name] == null ? `{${name}}` : String(values[name])
  );
}

export function equationEquals(locale = globalThis.Locale) {
  return getModLanguage(locale) === "ja" ? "＝" : "=";
}

export function additionOperator(locale = globalThis.Locale) {
  return getModLanguage(locale) === "ja" ? "＋" : "+";
}

export function subtractionOperator(locale = globalThis.Locale) {
  return getModLanguage(locale) === "ja" ? "−" : "−";
}

export function additionSeparator(locale = globalThis.Locale) {
  return ` ${additionOperator(locale)} `;
}

export function parenthesize(value, locale = globalThis.Locale) {
  return getModLanguage(locale) === "ja" ? `（${value}）` : ` (${value})`;
}

export function percentagePointChange(value, locale = globalThis.Locale) {
  const suffix = getModLanguage(locale) === "ja" ? "pt" : "pp";
  return `${value}${suffix}`;
}
