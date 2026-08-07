import { WeightedYieldConfig } from "./config.js";
import {
  additionOperator,
  additionSeparator,
  equationEquals,
  percentagePointChange,
  subtractionOperator,
  t,
} from "./i18n.js";
import { formatScore } from "./scorer.js";

const YIELD_LABELS = {
  YIELD_DIPLOMACY: "Influence",
  YIELD_PRODUCTION: "Production",
  YIELD_SCIENCE: "Science",
  YIELD_CULTURE: "Culture",
  YIELD_GOLD: "Gold",
  YIELD_FOOD: "Food",
  YIELD_HAPPINESS: "Happiness",
};

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function signedScore(
  value,
  decimals = WeightedYieldConfig.display.panelDecimals,
) {
  const number = Number(value);
  const sign = number > 0 ? "+" : "";
  return `${sign}${formatScore(number, decimals)}`;
}

function unsignedMagnitude(
  value,
  decimals = WeightedYieldConfig.display.panelDecimals,
) {
  return formatScore(Math.abs(Number(value)), decimals);
}

function localizedYieldName(yieldType) {
  const definition = globalThis.GameInfo?.Yields?.lookup?.(yieldType) ??
    Array.from(globalThis.GameInfo?.Yields ?? []).find(
      (entry) => entry?.YieldType === yieldType,
    );
  const key = definition?.Name;
  return key
    ? globalThis.Locale?.compose?.(key) ?? String(key)
    : YIELD_LABELS[yieldType] ?? yieldType;
}

function orderedYieldTypes(record) {
  const ordered = [];
  const seen = new Set();
  for (const definition of globalThis.GameInfo?.Yields ?? []) {
    const yieldType = definition?.YieldType;
    if (!yieldType || seen.has(yieldType)) continue;
    seen.add(yieldType);
    ordered.push(yieldType);
  }
  for (const yieldType of Object.keys(record ?? {})) {
    if (seen.has(yieldType)) continue;
    seen.add(yieldType);
    ordered.push(yieldType);
  }
  return ordered;
}

function contributionExpression(record, contributions) {
  const terms = [];
  for (const yieldType of orderedYieldTypes(record)) {
    const value = numberOrZero(record?.[yieldType]);
    if (Math.abs(value) < 1e-9) continue;
    const contribution = numberOrZero(contributions?.[yieldType]);
    const weight = contribution / value;
    const multiplier = Math.abs(weight - 1) < 1e-9
      ? ""
      : ` × ${formatScore(weight, 3)}`;
    terms.push(
      `${localizedYieldName(yieldType)} ${signedScore(value, 2)}${multiplier}`,
    );
  }
  return terms.length ? terms.join(additionSeparator()) : t("noChange");
}

function happinessAdjustmentLines(adjustment) {
  if (!adjustment || Math.abs(numberOrZero(adjustment.adjustment)) < 1e-9) {
    return [];
  }
  const delta = numberOrZero(adjustment.happinessDelta);
  const deltaOperator = delta >= 0 ? additionOperator() : subtractionOperator();
  const recoveryRate = numberOrZero(adjustment.recoveryRate);
  const pointValue = recoveryRate > 0
    ? `+${formatScore(recoveryRate * 100, 2)}`
    : formatScore(recoveryRate * 100, 2);
  const pointChange = percentagePointChange(pointValue);
  const beforePenalty = numberOrZero(adjustment.beforePenaltyRate) * 100;
  const afterPenalty = numberOrZero(adjustment.afterPenaltyRate) * 100;
  const signedRate = recoveryRate >= 0
    ? `${formatScore(recoveryRate * 100, 2)}%`
    : `-${formatScore(Math.abs(recoveryRate) * 100, 2)}%`;
  return [
    t("happinessBreakdown"),
    t("happinessChange", {
      before: formatScore(adjustment.beforeHappiness, 2),
      operator: deltaOperator,
      delta: formatScore(Math.abs(delta), 2),
      after: formatScore(adjustment.afterHappiness, 2),
    }),
    t("yieldPenalty", {
      before: `-${formatScore(beforePenalty, 2)}%`,
      after: `-${formatScore(afterPenalty, 2)}%`,
      change: pointChange,
    }),
    t("happinessValue", {
      output: formatScore(adjustment.penaltyFreeWeightedOutput, 2),
      rate: signedRate,
      value: formatScore(adjustment.adjustment, 2),
    }),
  ];
}

export function getPopulationEvaluationDetailModel(scored, kind, foodWeight) {
  if (!scored) return null;
  const record = scored.record ?? {};
  const contributions = scored.contributions ?? {};
  const lines = [
    t("weightedValueHeading"),
    contributionExpression(record, contributions),
  ];

  if (
    Math.abs(numberOrZero(scored.happinessAdjustment?.adjustment)) >= 1e-9
  ) {
    const adjustment = numberOrZero(scored.happinessAdjustment.adjustment);
    const operator = adjustment >= 0
      ? additionOperator()
      : subtractionOperator();
    lines.push(
      `${operator} ${t("happinessAdjustment")} ${unsignedMagnitude(adjustment, 2)}`,
    );
  }
  lines.push(`${equationEquals()} [B]${formatScore(scored.score, 2)}[/B]`);

  if (Number.isFinite(Number(foodWeight)) && Number(foodWeight) > 0) {
    lines.push(t("foodMultiplier", { value: formatScore(foodWeight, 3) }));
  }
  lines.push(...happinessAdjustmentLines(scored.happinessAdjustment));

  return {
    title: kind === "specialist"
      ? t("specialistPlacementEvaluation")
      : t("ruralPlacementEvaluation"),
    breakdown: lines.join("\n"),
  };
}
