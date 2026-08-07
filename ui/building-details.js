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

function additiveTerm(label, value) {
  const number = Number(value);
  const operator = number >= 0 ? additionOperator() : subtractionOperator();
  return `${operator} ${label} ${unsignedMagnitude(number, 2)}`;
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
    const value = Number(record?.[yieldType] ?? 0);
    if (!Number.isFinite(value) || Math.abs(value) < 1e-9) continue;
    const contribution = Number(contributions?.[yieldType] ?? 0);
    const weight = contribution / value;
    const multiplier = Math.abs(weight - 1) < 1e-9
      ? ""
      : ` × ${formatScore(weight, 3)}`;
    terms.push(
      `${localizedYieldName(yieldType)} ${signedScore(value, 2)}${multiplier}`,
    );
  }
  if (!terms.length) return t("noChange");
  return terms.join(additionSeparator());
}

function happinessTransitionLine(adjustment) {
  const delta = Number(adjustment.happinessDelta);
  const operator = delta >= 0 ? additionOperator() : subtractionOperator();
  return (
    t("happinessChange", {
      before: formatScore(adjustment.beforeHappiness, 2),
      operator,
      delta: formatScore(Math.abs(delta), 2),
      after: formatScore(adjustment.afterHappiness, 2),
    })
  );
}

function penaltyPercent(rate) {
  const percent = Number(rate) * 100;
  return percent > 0 ? `-${formatScore(percent, 2)}%` : "0%";
}

function happinessAdjustmentLines(adjustment) {
  if (!adjustment || Math.abs(Number(adjustment.adjustment)) < 1e-9) return [];
  const recoveryRate = Number(adjustment.recoveryRate);
  const signedRate = recoveryRate >= 0
    ? `${formatScore(recoveryRate * 100, 2)}%`
    : `-${formatScore(Math.abs(recoveryRate) * 100, 2)}%`;
  const pointValue = recoveryRate > 0
    ? `+${formatScore(recoveryRate * 100, 2)}`
    : formatScore(recoveryRate * 100, 2);
  const pointChange = percentagePointChange(pointValue);
  return [
    t("happinessBreakdown"),
    happinessTransitionLine(adjustment),
    t("yieldPenalty", {
      before: penaltyPercent(adjustment.beforePenaltyRate),
      after: penaltyPercent(adjustment.afterPenaltyRate),
      change: pointChange,
    }),
    t("happinessValue", {
      output: formatScore(adjustment.penaltyFreeWeightedOutput, 2),
      rate: signedRate,
      value: formatScore(adjustment.adjustment, 2),
    }),
  ];
}

export function getBuildingListScoreLabel(evaluation) {
  const parts = getBuildingListScoreParts(evaluation);
  if (!parts) return "";
  return (
    `W${parts.weightedValue}` +
    `｜E${parts.efficiency}`
  );
}

export function getBuildingListScoreParts(evaluation) {
  if (!evaluation) return null;
  return {
    weightedValue: formatScore(evaluation.score, 2),
    efficiency: formatScore(evaluation.priority, 0),
  };
}

function localizedConstructibleName(definition) {
  const key = definition?.Name ?? definition?.ConstructibleType;
  if (!key) return "";
  return globalThis.Locale?.compose?.(key) ?? String(key);
}

function relocationDestinationLabel(evaluation) {
  const relocation = evaluation?.relocation;
  if (!relocation) return "";
  if (relocation.kind === "specialist") return t("specialist");
  const improvement = localizedConstructibleName(
    relocation.scored?.constructible,
  );
  return improvement
    ? t("ruralWithImprovement", { improvement })
    : t("rural");
}

export function getBuildingEvaluationDetailModel(evaluation) {
  if (!evaluation) return null;
  const lines = [t("weightedValueHeading")];

  if (evaluation.ruralReplacement) {
    lines.push(
      contributionExpression(
        evaluation.buildingRecord,
        evaluation.buildingContributions,
      ),
      `${additionOperator()} ${t("relocationYield", {
        expression: contributionExpression(
          evaluation.relocation?.record,
          evaluation.relocationContributions,
        ),
      })}`,
    );
  } else {
    lines.push(
      contributionExpression(
        evaluation.correctedRecord,
        evaluation.correctedContributions,
      ),
    );
  }
  if (
    Math.abs(Number(evaluation.happinessAdjustment?.adjustment ?? 0)) >= 1e-9
  ) {
    lines.push(
      additiveTerm(
        t("happinessAdjustment"),
        evaluation.happinessAdjustment.adjustment,
      ),
    );
  }
  lines.push(`${equationEquals()} [B]${formatScore(evaluation.score, 2)}[/B]`);

  const productionCost = Number(evaluation.productionCost);
  const scale =
    Number(WeightedYieldConfig.buildingValuation.priorityScale) || 10000;
  if (Number.isFinite(productionCost) && productionCost > 0) {
    lines.push(
      t("efficiencyHeading"),
      `${formatScore(evaluation.score, 2)} ÷ ${formatScore(
        productionCost,
        2,
      )} [icon:YIELD_PRODUCTION] × ${formatScore(scale, 0)} ${equationEquals()} [B]${formatScore(
        evaluation.priority,
        0,
      )}[/B]`,
    );
  }
  lines.push(...happinessAdjustmentLines(evaluation.happinessAdjustment));

  const destination = relocationDestinationLabel(evaluation);
  return {
    title: t("buildingEvaluation"),
    summary: "",
    breakdown: lines.join("\n"),
    destination: destination ? t("relocationDestination", { destination }) : "",
  };
}
